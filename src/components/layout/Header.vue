<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import { AuthClientService } from '@/services/client/auth.client.service';

const isAuthenticated = ref(false);

onMounted(async () => {
  try {
    const { data, error } = await AuthClientService.getSession();
    isAuthenticated.value = !!data?.user;
  } catch (error) {
    console.error('Failed to check authentication status:', error);
  }
});

const handleLogout = async () => {
  try {
    await AuthClientService.logout();
    toast.success('Logged out successfully');
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Failed to log out');
  }
};
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <a href="/" class="text-xl font-bold text-gray-900">Project Manager</a>
      
      <div class="flex items-center gap-4">
        <Button v-if="isAuthenticated" variant="outline" @click="handleLogout">
          Logout
        </Button>
      </div>
    </div>
  </header>
</template>
