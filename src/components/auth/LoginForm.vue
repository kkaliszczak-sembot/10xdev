<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';
import { AuthClientService } from '@/services/client/auth.client.service';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const emailError = ref('');
const passwordError = ref('');

const validate = () => {
  let valid = true;
  emailError.value = '';
  passwordError.value = '';
  if (!email.value) {
    emailError.value = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address';
    valid = false;
  }
  if (!password.value) {
    passwordError.value = 'Password is required';
    valid = false;
  }
  return valid;
};

const handleLogin = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Validate inputs
    if (!validate()) {
      return;
    }
    
    // Sign in with AuthService
    const { error } = await AuthClientService.login(
      email.value,
      password.value
    );
    
    if (error) {
      errorMessage.value = error.message || 'Failed to login. Please check your credentials.';
      toast.error('Login failed', {
        description: errorMessage.value,
      });
      return;
    }
    
    // Success - redirect to dashboard
    toast.success('Login successful', {
      description: 'Welcome back to Project Manager',
    });
    
    // Redirect to dashboard
    window.location.href = '/';
  } catch (err) {
    console.error('Login error:', err);
    errorMessage.value = 'An unexpected error occurred. Please try again.';
    toast.error('Login error', {
      description: errorMessage.value,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <form @submit.prevent="handleLogin" autocomplete="on">
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
            placeholder="Your password"
            autocomplete="current-password"
            :disabled="isLoading"
            aria-describedby="password-error"
            required
          />
          <div v-if="passwordError" id="password-error" class="text-red-500 text-xs mt-1">{{ passwordError }}</div>
        </div>
        <div v-if="errorMessage" class="text-red-600 text-sm mb-2">{{ errorMessage }}</div>
        <Button class="w-full" :disabled="isLoading" type="submit">
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </Button>
      </form>
  </div>
</template>