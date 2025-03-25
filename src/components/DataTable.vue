<template>
  <div class="table-responsive">
    <table class="w-100 table table-bordered table-hover">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
            :class="[
              column.headerClass, // Apply header class
              column.sortable ? 'cursor-pointer' : 'user-select-none', // Underline for sortable columns
              sortKey === column.key && sortedClass,
            ]"
            @click="column.sortable ? toggleSort(column.key) : null">
            <slot :name="`header-${column.key}`">
              {{ column.label }}
              <span v-if="column.sortable">
                <!-- Show the sorting arrows based on the current sort state -->
                <span v-if="sortKey === column.key">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </span>
            </slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in sortedData" :key="rowIndex">
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[
              column.rowClass, // Apply row class
              sortKey === column.key && sortedClass,
            ]">
            <slot :name="`cell-${column.key}`" :value="row[column.key]" :row="row">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

export type Column = {
  key: string;
  label: string;
  width?: string;
  headerClass?: string; // Class for the header
  rowClass?: string; // Class for the row cells
  class?: string; // Optional class for both header and cell (can be used globally)
  sortable?: boolean; // If the column is sortable
};

export type TableRow = Record<string, unknown>;

type SortOrder = "asc" | "desc" | null;

const props = defineProps<{
  columns: Column[];
  data: TableRow[];
  defaultSortKey?: string;
  defaultSortOrder?: SortOrder;
  sortedClass?: string; // Optional custom class for sorted column
}>();

const sortKey = ref<string | null>(props.defaultSortKey ?? null);
const sortOrder = ref<SortOrder>(props.defaultSortOrder ?? null);

// Set the initial sorting arrow and sorting order when the component is mounted
onMounted(() => {
  if (sortKey.value && !sortOrder.value) {
    // If sort order is not provided, set to "asc" by default
    sortOrder.value = "asc";
  }
});

// Function to compare values for sorting
const compareValues = (a: unknown, b: unknown): number => {
  // Handle Date sorting
  if (a instanceof Date && b instanceof Date) {
    return sortOrder.value === "asc" ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
  }

  // Handle boolean sorting: Convert boolean to 1 (true) or 0 (false)
  if (typeof a === "boolean" && typeof b === "boolean") {
    return sortOrder.value === "asc" ? Number(a) - Number(b) : Number(b) - Number(a);
  }

  // Handle string sorting
  if (typeof a === "string" && typeof b === "string") {
    return sortOrder.value === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  }

  // Handle number sorting
  if (typeof a === "number" && typeof b === "number") {
    return sortOrder.value === "asc" ? a - b : b - a;
  }

  return 0;
};

// Computed property for sorted data
const sortedData = computed(() => {
  if (!sortKey.value || !sortOrder.value) {
    return props.data;
  }

  return [...props.data].sort((a, b) => {
    const valueA = a[sortKey.value!] as unknown;
    const valueB = b[sortKey.value!] as unknown;

    return compareValues(valueA, valueB);
  });
});

// Handle sort toggle
const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    // Toggle sort order (asc <-> desc)
    sortOrder.value = sortOrder.value === "asc" ? "desc" : sortOrder.value === "desc" ? null : "asc";
    if (!sortOrder.value) {
      sortKey.value = null;
    } // Clear sorting if no order
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
