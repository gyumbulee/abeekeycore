<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\HasSpamHeuristics;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTrainingApplicationRequest extends FormRequest
{
    use HasSpamHeuristics;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => [
                'required',
                'string',
                'min:4',
                'max:120',
                // At least two space-separated words (first + last name).
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
                'regex:/^\+?[0-9\-\(\)\s]{7,30}$/',
            ],
            'course' => ['required', 'string', 'max:150'],
            'learning_goal' => ['nullable', 'string', 'max:2000'],
            'experience_level' => ['nullable', 'string', 'max:50'],
            'preferred_schedule' => ['nullable', 'string', 'max:100'],
            'delivery_mode' => ['nullable', 'string', 'max:50'],
            'preferred_batch' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
            // Honeypot — see HasSpamHeuristics::honeypotRule().
            'hp_field_9x2' => $this->honeypotRule(),
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.regex' => 'Please enter your full name (first and last name).',
            'full_name.min' => 'Please enter your full name (first and last name).',
            'phone.required' => 'Please enter your phone number.',
            'phone.regex' => 'Please enter a valid phone number.',
            'course.required' => 'Please select a course.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $name = (string) $this->input('full_name');
            $learningGoal = (string) $this->input('learning_goal');
            $notes = (string) $this->input('notes');

            foreach (preg_split('/\s+/', trim($name)) as $word) {
                if ($this->isGibberishWord($word)) {
                    $validator->errors()->add('full_name', 'Please enter your real full name.');
                    break;
                }
            }

            // learning_goal and notes are optional free text — only checked
            // for spam/gibberish when the applicant actually filled them in.
            foreach (['learning_goal' => $learningGoal, 'notes' => $notes] as $field => $text) {
                if ($text === '') {
                    continue;
                }

                if ($this->hasRepeatedCharacterSpam($text)) {
                    $validator->errors()->add($field, 'Please enter valid text.');
                }

                if ($this->hasExcessiveLinks($text)) {
                    $validator->errors()->add($field, 'Please remove links and try again.');
                }

                if ($this->isGibberishText($text)) {
                    $validator->errors()->add($field, 'This appears to contain gibberish. Please rewrite it clearly.');
                }
            }
        });
    }
}