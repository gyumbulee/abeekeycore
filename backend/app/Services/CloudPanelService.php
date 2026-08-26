<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Net\SSH2;

/**
 * Wraps CloudPanel's `clpctl` CLI over SSH.
 *
 * CloudPanel has no public REST API — confirmed against their own official
 * docs and a community feature-request thread explicitly asking them to
 * build one (still open, unimplemented as of writing). clpctl, their CLI,
 * is the only supported automation surface, and it only runs locally on
 * the server as root — there is no HTTP endpoint to call, so this service
 * connects over SSH and runs it remotely instead.
 *
 * Commands used here are confirmed against CloudPanel's official docs
 * (docs/v2/cloudpanel-cli):
 *   clpctl site:add:php --domainName=... --phpVersion=... --vhostTemplate='Generic' --siteUser=... --siteUserPassword=...
 *   clpctl site:delete --domainName=... --force
 *
 * db:add's exact flag names were only partially visible in the docs
 * available at build time — createDatabase() is best-effort (see its own
 * docblock) and its exact flags should be verified with
 * `clpctl db:add --help` directly on the server before relying on it.
 *
 * There is no "suspend" primitive in CloudPanel — their site lifecycle is
 * add / install-certificate / delete only (confirmed via CloudPanel's own
 * GitHub discussions). Non-payment suspension is therefore handled as an
 * admin-visible status flag in HostingOrder, not a real server-side
 * action — see Admin\HostingController.
 */
class CloudPanelService
{
    protected ?SSH2 $connection = null;

    protected function connect(): SSH2
    {
        if ($this->connection && $this->connection->isConnected()) {
            return $this->connection;
        }

        $host = config('hosting.ssh_host');

        if (! $host) {
            throw new \RuntimeException('HOSTING_SSH_HOST is not configured — cannot reach the CloudPanel server.');
        }

        $ssh = new SSH2($host, (int) config('hosting.ssh_port', 22), (int) config('hosting.ssh_timeout', 30));

        $keyPath = config('hosting.ssh_private_key_path');

        if (! $keyPath || ! is_file($keyPath)) {
            throw new \RuntimeException('Hosting SSH private key not found at the configured path: '.$keyPath);
        }

        $key = PublicKeyLoader::load(file_get_contents($keyPath));
        $username = config('hosting.ssh_username', 'root');

        if (! $ssh->login($username, $key)) {
            throw new \RuntimeException("SSH login to the CloudPanel server failed for user '{$username}'.");
        }

        return $this->connection = $ssh;
    }

    /**
     * Run a clpctl command over SSH.
     *
     * @param  array<string, string>  $args  --flag=value pairs
     * @param  string[]  $booleanFlags  bare --flag switches with no value (e.g. 'force')
     */
    protected function runClpctl(string $subcommand, array $args = [], array $booleanFlags = []): array
    {
        $ssh = $this->connect();

        $parts = ['clpctl', $subcommand];

        foreach ($args as $flag => $value) {
            // escapeshellarg() is safe here even though the result is sent
            // over SSH rather than run through a local shell — the remote
            // command still passes through a POSIX sh on the CloudPanel
            // server (Ubuntu), and escapeshellarg's quoting matches that.
            $parts[] = "--{$flag}=".escapeshellarg((string) $value);
        }

        foreach ($booleanFlags as $flag) {
            $parts[] = "--{$flag}";
        }

        $command = implode(' ', $parts);
        $output = (string) $ssh->exec($command);
        $exitStatus = $ssh->getExitStatus();

        if ($exitStatus !== 0) {
            // Never log $args verbatim — createSite()/createDatabase() pass
            // plaintext passwords through here.
            Log::error("clpctl {$subcommand} failed (exit {$exitStatus}) for domain in args: ".($args['domainName'] ?? 'unknown'));
        }

        return [
            'ok' => $exitStatus === 0,
            'exit_status' => $exitStatus,
            'output' => $output,
        ];
    }

    /**
     * Create a new CloudPanel PHP site + site-user account. Returns the
     * raw clpctl result — check ['ok'] before treating the site as live.
     */
    public function createSite(string $domainName, string $siteUser, string $siteUserPassword, string $phpVersion): array
    {
        return $this->runClpctl('site:add:php', [
            'domainName' => $domainName,
            'phpVersion' => $phpVersion,
            'vhostTemplate' => 'Generic',
            'siteUser' => $siteUser,
            'siteUserPassword' => $siteUserPassword,
        ]);
    }

    /**
     * Best-effort database creation. A hosting order is still considered
     * successfully provisioned even if this fails (see
     * HostingProvisioningProcessor) — the client can create a database
     * themselves from within CloudPanel, or support can do it manually.
     * Flag names here are our best reading of CloudPanel's docs but were
     * not fully confirmed at build time — verify with
     * `clpctl db:add --help` on the actual server before depending on this.
     */
    public function createDatabase(string $domainName, string $databaseName, string $databaseUser, string $databasePassword): array
    {
        return $this->runClpctl('db:add', [
            'domainName' => $domainName,
            'databaseName' => $databaseName,
            'databaseUserName' => $databaseUser,
            'databaseUserPassword' => $databasePassword,
        ]);
    }

    /**
     * Permanently deletes the site and all its resources on the server —
     * irreversible. Only call this for genuine cancellations, never as a
     * non-payment suspension (CloudPanel has no reversible suspend
     * primitive — see class docblock).
     */
    public function deleteSite(string $domainName): array
    {
        return $this->runClpctl('site:delete', ['domainName' => $domainName], ['force']);
    }
}
