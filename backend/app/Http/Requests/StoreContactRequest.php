<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:4',
                'max:120',
                // At least two space-separated words (first + last name), each
                // starting with a letter — blocks single-word entries, usernames,
                // and pasted links or emails.
                'regex:/^[\pL][\pL\'\-]*(\s+[\pL][\pL\'\-]*)+$/u',
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:150',
            ],
            'phone' => [
                'required',
                'string',
                'max:30',
                // Allows a leading country dial code (e.g. "+234") followed by the number.
                'regex:/^\+?[0-9\-\(\)\s]{7,30}$/',
            ],
            'company' => ['nullable', 'string', 'max:150'],
            'subject' => ['required', 'string', 'min:3', 'max:150'],
            'message' => [
                'required',
                'string',
                'min:15',
                'max:5000',
            ],
            // Honeypot — must stay empty. Real visitors never see or fill this field;
            // only bots that auto-fill every input will. Named deliberately unlike
            // "website"/"url"/"company" so browser autofill won't populate it too.
            'hp_field_9x2' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Please enter your full name (first and last name).',
            'name.min' => 'Please enter your full name (first and last name).',
            'phone.required' => 'Please enter your phone number.',
            'phone.regex' => 'Please enter a valid phone number.',
            'subject.required' => 'Please let us know the subject of your enquiry.',
            'message.min' => 'Please provide a bit more detail (at least 15 characters).',
        ];
    }

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
     * Extra spam heuristics that a simple rule list can't express cleanly.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $message = (string) $this->input('message');
            $name = (string) $this->input('name');
            $subject = (string) $this->input('subject');

            // More than 2 links in a message from a first-time enquiry is almost
            // always spam/SEO-bot content, not a genuine project enquiry.
            if (preg_match_all('/https?:\/\/|www\./i', $message) > 2) {
                $validator->errors()->add('message', 'Your message looks like it may be spam. Please remove links and try again.');
            }

            // Same character repeated 8+ times in a row ("aaaaaaaa...") is a
            // near-universal spam/bot signature.
            if (preg_match('/(.)\1{7,}/', $message)) {
                $validator->errors()->add('message', 'Please enter a valid message.');
            }
            if (preg_match('/(.)\1{7,}/', $subject)) {
                $validator->errors()->add('subject', 'Please enter a valid subject.');
            }

            // Gibberish name check: any word of 5+ letters with no vowel at all
            // is almost never a real name.
            foreach (preg_split('/\s+/', trim($name)) as $word) {
                if ($this->isGibberishWord($word)) {
                    $validator->errors()->add('name', 'Please enter your real full name.');
                    break;
                }
            }

            // Gibberish subject check: same rule — one bad word is enough since
            // subjects are short and every word should be meaningful.
            foreach (preg_split('/\s+/', trim($subject)) as $word) {
                if ($this->isGibberishWord($word)) {
                    $validator->errors()->add('subject', 'Please enter a real subject for your enquiry.');
                    break;
                }
            }

            // Gibberish message check: a handful of nonsense words scattered in an
            // otherwise real message shouldn't block it, so this only fires when a
            // meaningful share of the longer words are vowel-less nonsense.
            $words = preg_split('/\s+/', trim($message));
            $checkable = array_filter($words, fn ($w) => mb_strlen(preg_replace('/[^\pL]/u', '', $w)) >= 4);
            if (count($checkable) >= 3) {
                $gibberishCount = count(array_filter($checkable, fn ($w) => $this->isGibberishWord($w)));
                if ($gibberishCount / count($checkable) > 0.4) {
                    $validator->errors()->add('message', 'Your message appears to contain gibberish. Please rewrite it clearly.');
                }
            }

            // Reject messages that are just the name pasted in, or vice versa —
            // a common low-effort spam pattern.
            if ($name !== '' && mb_strtolower(trim($message)) === mb_strtolower(trim($name))) {
                $validator->errors()->add('message', 'Please tell us a bit more about your enquiry.');
            }
        });
    }
}