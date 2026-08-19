<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\HasSpamHeuristics;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuotationRequest extends FormRequest
{
    use HasSpamHeuristics;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_name' => [
                'required',
                'string',
                'min:4',
                'max:120',
                // At least two space-separated words (first + last name).
                'regex:/^[\pL][\pL\'\-]*(\s+[\pL][\pL\'\-]*)+$/u',
            ],
            'company_name' => ['nullable', 'string', 'max:150'],
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
            'service_interest' => ['required', 'string', 'min:3', 'max:150'],
            'project_summary' => [
                'required',
                'string',
                'min:20',
                'max:5000',
            ],
            'budget_range' => ['nullable', 'string', 'max:80'],
            // Honeypot — see HasSpamHeuristics::honeypotRule().
            'hp_field_9x2' => $this->honeypotRule(),
        ];
    }

    public function messages(): array
    {
        return [
            'client_name.regex' => 'Please enter your full name (first and last name).',
            'client_name.min' => 'Please enter your full name (first and last name).',
            'phone.required' => 'Please enter your phone number.',
            'phone.regex' => 'Please enter a valid phone number.',
            'service_interest.required' => 'Please let us know what service you\'re interested in.',
            'project_summary.min' => 'Please provide a bit more detail about your project (at least 20 characters).',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $summary = (string) $this->input('project_summary');
            $name = (string) $this->input('client_name');
            $service = (string) $this->input('service_interest');

            if ($this->hasExcessiveLinks($summary)) {
                $validator->errors()->add('project_summary', 'Your project summary looks like it may be spam. Please remove links and try again.');
            }

            if ($this->hasRepeatedCharacterSpam($summary)) {
                $validator->errors()->add('project_summary', 'Please enter a valid project summary.');
            }
            if ($this->hasRepeatedCharacterSpam($service)) {
                $validator->errors()->add('service_interest', 'Please enter a valid service.');
            }

            foreach (preg_split('/\s+/', trim($name)) as $word) {
                if ($this->isGibberishWord($word)) {
                    $validator->errors()->add('client_name', 'Please enter your real full name.');
                    break;
                }
            }

            foreach (preg_split('/\s+/', trim($service)) as $word) {
                if ($this->isGibberishWord($word)) {
                    $validator->errors()->add('service_interest', 'Please describe the service you\'re interested in clearly.');
                    break;
                }
            }

            if ($this->isGibberishText($summary)) {
                $validator->errors()->add('project_summary', 'Your project summary appears to contain gibberish. Please rewrite it clearly.');
            }

            if ($name !== '' && mb_strtolower(trim($summary)) === mb_strtolower(trim($name))) {
                $validator->errors()->add('project_summary', 'Please tell us a bit more about your project.');
            }
        });
    }
}