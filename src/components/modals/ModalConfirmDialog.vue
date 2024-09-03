<template>
  <div class="modal fade border-primary" ref="element" aria-hidden="true" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-primary shadow-sm border-2 border">
        <div class="modal-header bg-primary text-white rounded-0">
          <h5 class="modal-title">{{ props.title }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" @click="cancel"></button>
        </div>
        <div class="modal-body">
          <slot name="body"/>
        </div>

        <div class="modal-footer bg-light d-flex justify-content-between">
          <button class="btn btn-danger" @click="cancel">Cancel</button>
          <button class="btn btn-primary" @click="ok" :disabled="working">
            <span class="spinner-border spinner-border-sm text-light" role="status" v-show="working">
              <span class="visually-hidden">Loading...</span>
            </span>
            Ok
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//import { Modal } from 'bootstrap';
import Modal from './Modal';
import { defineEmits, defineProps, onMounted, onUnmounted, ref, watch } from 'vue';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  show: boolean
  title: string
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

let modal: Modal | null = null;
const working = ref(false);
const element = ref<HTMLDivElement | null>(null);

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>();

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(() => modal = new Modal(element.value!));

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(() => props.show, (val) => {
  working.value = false;

  if (val) {
    modal?.show();
  } else {
    modal?.hide();
  }
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const ok = () => {
  working.value = true;
  emit('confirm');
};

const cancel = () => {
  working.value = false;
  modal?.hide();
  emit('cancel');
};
</script>

<style scoped>

</style>
