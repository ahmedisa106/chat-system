<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string'],
            'avatar'                => ['required', 'file', 'image'],
            'phone'                 => ['required', "regex:/^01[0125][0-9]{8}$/", 'unique:users,phone'],
            'password'              => ['required', 'confirmed', 'min:8'],
            'password_confirmation' => ['required']
        ];
    }
}
