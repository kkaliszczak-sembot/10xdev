<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { AuthClientService } from '@/services/client/auth.client.service';

const email = ref('');
const password = ref('');
const name = ref('');
const isLoading = ref(false);
const success = ref(false);
const emailError = ref('');
const passwordError = ref('');
const nameError = ref('');

const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  emailError.value = '';
  passwordError.value = '';
  nameError.value = '';
  
  // Validate email
  if (!email.value) {
    emailError.value = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address';
    isValid = false;
  }
  
  // Validate password
  if (!password.value) {
    passwordError.value = 'Password is required';
    isValid = false;
  } else if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long';
    isValid = false;
  }
  
  // Validate name
  if (!name.value) {
    nameError.value = 'Name is required';
    isValid = false;
  }
  
  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    const { data, error } = await AuthClientService.register(
      email.value,
      password.value,
      name.value
    );
    
    if (error) {
      toast.error('Registration failed', {
        description: error
      });
    } else {
      success.value = true;
      toast.success('Registration successful', {
        description: 'Please check your email to confirm your account'
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  } catch (error) {
    toast.error('An unexpected error occurred', {
      description: 'Please try again later'
    });
    console.error('Registration error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <form v-if="!success" @submit.prevent="handleRegister" autocomplete="on">
        <div class="mb-4">
          <Label for="name" class="mb-2">Name</Label>
          <Input
            id="name"
            type="text"
            v-model="name"
            placeholder="Your name"
            autocomplete="name"
            :disabled="isLoading"
            aria-describedby="name-error"
            required
          />
          <div v-if="nameError" id="name-error" class="text-red-500 text-xs mt-1">{{ nameError }}</div>
        </div>
        <div class="mb-4">
          <Label for="email" class="mb-2">Email</Label>
          <Input
            id="email"
            type="email"
            v-model="email"
            placeholder="you@email.com"
            autocomplete="email"
            :disabled="isLoading"
            aria-describedby="email-error"
            required
          />
          <div v-if="emailError" id="email-error" class="text-red-500 text-xs mt-1">{{ emailError }}</div>
        </div>
        <div class="mb-4">
          <Label for="password" class="mb-2">Password</Label>
          <Input
            id="password"
            type="password"
            v-model="password"
            placeholder="At least 8 characters"
            autocomplete="new-password"
            :disabled="isLoading"
            aria-describedby="password-error"
            required
          />
          <div v-if="passwordError" id="password-error" class="text-red-500 text-xs mt-1">{{ passwordError }}</div>
        </div>
        <Button class="w-full mt-4" :disabled="isLoading" type="submit">
          <span v-if="isLoading">Registering...</span>
          <span v-else>Register</span>
        </Button>
      </form>
      <div v-else class="text-center">
        <div class="text-2xl font-semibold mb-2">Welcome!</div>
        <div class="mb-4">Your account has been created.<br />Please check your email to confirm your registration before logging in.</div>
        <a href="/login" class="text-blue-600 hover:underline">Go to login</a>
      </div>
  </div>
</template>
