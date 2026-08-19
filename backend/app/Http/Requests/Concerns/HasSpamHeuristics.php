<?php

namespace App\Http\Requests\Concerns;

/**
 * Shared content-quality heuristics for public-facing form requests
 * (contact, quotation, training). Kept as plain string-in/bool-out helpers
 * so they're easy to unit test in isolation later.
 */
trait HasSpamHeuristics
{
    /**
     * A word is treated as gibberish if it's long enough to judge (5+ letters)
     * but contains no vowel at all — e.g. "asdfgh", "qwerty", "xzcvbn".
     * Real words of that length virtually always contain a vowel.
     */
    protected function isGibberishWord(string $word): bool
    {
        $letters = preg_replace('/[^\pL]/u', '', $word);

        return mb_strlen($letters) >= 5 && !preg_match('/[aeiouAEIOU]/u', $letters);
    }

    /**
     * True if a meaningful share of a free-text field's longer words (4+
     * letters) are gibberish. Requires at least $minWords qualifying words
     * before judging, so short or odd-but-real text isn't penalised for one
     * unusual word.
     */
    protected function isGibberishText(string $text, float $threshold = 0.4, int $minWords = 3): bool
    {
        $words = preg_split('/\s+/', trim($text));
        $checkable = array_filter($words, fn ($w) => mb_strlen(preg_replace('/[^\pL]/u', '', $w)) >= 4);

        if (count($checkable) < $minWords) {
            return false;
        }

        $gibberishCount = count(array_filter($checkable, fn ($w) => $this->isGibberishWord($w)));

        return $gibberishCount / count($checkable) > $threshold;
    }

    /**
     * Same character repeated 8+ times in a row ("aaaaaaaa...") is a
     * near-universal spam/bot signature.
     */
    protected function hasRepeatedCharacterSpam(string $text): bool
    {
        return (bool) preg_match('/(.)\1{7,}/', $text);
    }

    /**
     * More than $max links in a first-time enquiry is almost always
     * spam/SEO-bot content rather than a genuine message.
     */
    protected function hasExcessiveLinks(string $text, int $max = 2): bool
    {
        return preg_match_all('/https?:\/\/|www\./i', $text) > $max;
    }

    /**
     * Standard honeypot rule — field must stay empty. Pair with a form field
     * named unlike "website"/"url"/"company" so browser autofill won't
     * populate it and false-flag real users.
     */
    protected function honeypotRule(): array
    {
        return ['prohibited'];
    }
}