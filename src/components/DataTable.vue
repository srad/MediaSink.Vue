<template>
  <div class="table-responsive">
    <table class="w-100 table table-bordered table-hover table-rounded">
      <thead>
      <!-- Search Inputs/Checkboxes Row -->
      <tr>
        <th class="user-select-none" v-for="column in columns" :key="column.key" :rowspan="column.isSearchable ? 1 : 2" :style="{ width: column.width }" :class="[column.headerClass, column.isSearchable ? 'searchable-column' : '', column.sortable ? 'cursor-pointer' : 'user-select-none']">
          <!-- Search input for searchable columns -->
          <div v-if="column.isSearchable" class="search-container">
            <!-- Checkbox for boolean columns -->
            <input v-if="column.type === 'boolean'" type="checkbox" v-model="searchQueries[column.key]" @click.stop="handleCheckboxChange(column.key)"/>
            <!-- Input for non-boolean columns -->
            <input v-if="column.type !== 'boolean'" v-model="searchQueries[column.key]" type="text" :placeholder="column.label" class="form-control border-primary-subtle"/>
          </div>
          <div v-else @click="column.sortable && toggleSort(column.key)">
            <slot :name="`header-${column.key}`">
              {{ column.label }}
            </slot>
            <span v-if="sortKey === column.key">
              <span v-if="sortOrder === 'asc'">↑</span>
              <span v-if="sortOrder === 'desc'">↓</span>
            </span>
          </div>
        </th>
      </tr>

      <!-- Column Titles Row -->
      <tr>
        <template v-for="column in columns" :key="`header-${column.key}`">
          <th class="user-select-none" v-if="column.isSearchable" :style="{ width: column.width }" :class="[column.headerClass, column.sortable ? 'cursor-pointer' : 'user-select-none', sortKey === column.key && sortedClass]" @click="toggleSort(column.key)" :rowspan="column.sortable ? 1 : 2">
            <!-- Set rowspan for sortable columns -->
            <!-- Column title with sorting click event -->
            <slot :name="`header-${column.key}`">
              {{ column.label }}
            </slot>
            <span v-if="sortKey === column.key">
              <span v-if="sortOrder === 'asc'">↑</span>
              <span v-if="sortOrder === 'desc'">↓</span>
            </span>
          </th>
        </template>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, rowIndex) in currentPageRows" :key="rowIndex">
        <td v-for="column in columns" :key="column.key" :class="[column.rowClass, sortKey === column.key && sortedClass]">
          <slot :name="`cell-${column.key}`" :value="row[column.key]" :row="row">
            {{ row[column.key] }}
          </slot>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <nav aria-label="Table Pagination">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="changePage(currentPage - 1)" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
          <button class="page-link" @click="changePage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="changePage(currentPage + 1)" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>

      <!-- Page Size Dropdown -->
      <div class="d-flex justify-content-center mt-3">
        <select class="form-select w-auto" v-model="pageSize" @change="onPageSizeChange">
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }} rows per page</option>
          <option value="-1">All</option>
          <!-- Add 'All' option -->
        </select>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, ref } from "vue";

export type Column = {
  key: string;
  label: string;
  width?: string;
  headerClass?: string;
  rowClass?: string;
  class?: string;
  sortable?: boolean;
  isSearchable?: boolean;
  type?: "boolean" | "string" | "number" | "date";
};

export type TableRow = Record<string, unknown>;

type SortOrder = "asc" | "desc" | null;

const sortedClass = "col-sorted";

const props = defineProps<{
  columns: Column[];
  data: TableRow[];
  defaultSortKey?: string;
  defaultSortOrder?: SortOrder;
  pageSize?: number; // Make pageSize optional
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
  (event: "page-size-change", size: number): void;
}>();

const sortKey = ref<string | null>(props.defaultSortKey ?? null);
const sortOrder = ref<SortOrder>(props.defaultSortOrder ?? null);
const searchQueries = ref<Record<string, unknown>>({});
const currentPage = ref(1); // Track current page
const pageSize = ref<number>(props.pageSize ?? 10); // Default page size to 10 if not provided
const pageSizeToNumber = computed(() => Number(pageSize.value));

const pageSizes = [ 10, 20, 50, 100 ]; // Options for page size

onMounted(() => {
  if (sortKey.value && !sortOrder.value) {
    sortOrder.value = "asc";
  }
});

const compareValues = (a: unknown, b: unknown): number => {
  // Convert date strings to Date objects if needed
  if (typeof a === "string" && !isNaN(Date.parse(a))) {
    a = new Date(a);
  }
  if (typeof b === "string" && !isNaN(Date.parse(b))) {
    b = new Date(b);
  }

  // Date comparison
  if (a instanceof Date && b instanceof Date) {
    return sortOrder.value === "asc" ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
  }

  // Convert numeric strings to numbers if needed
  if (typeof a === "string" && !isNaN(parseFloat(a))) {
    a = parseFloat(a);
  }
  if (typeof b === "string" && !isNaN(parseFloat(b))) {
    b = parseFloat(b);
  }

  // Number comparison
  if (typeof a === "number" && typeof b === "number") {
    return sortOrder.value === "asc" ? a - b : b - a;
  }

  // Number comparison
  if (typeof a === "boolean" && typeof b === "boolean") {
    return sortOrder.value === "asc" ? Number(a) - Number(b) : Number(b) - Number(a);
  }

  // Default case (string sorting)
  if (typeof a === "string" && typeof b === "string") {
    return sortOrder.value === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  }

  return 0;
};

const sortedData = computed(() => {
  if (!sortKey.value || !sortOrder.value) {
    return props.data;
  }

  return [ ...props.data ].sort((a, b) => {
    const valueA = a[sortKey.value!] as unknown;
    const valueB = b[sortKey.value!] as unknown;

    return compareValues(valueA, valueB);
  });
});

const filteredData = computed(() => {
  return sortedData.value.filter((row) => {
    return props.columns.every((column) => {
      const searchQuery = searchQueries.value[column.key];
      const cellValue = row[column.key];

      if (!searchQuery && searchQuery !== false && searchQuery !== true) {
        return true;
      }

      if (cellValue instanceof Date) {
        return cellValue.toLocaleDateString("en-GB").includes(searchQuery as string);
      }

      if (typeof searchQuery === "boolean" && typeof cellValue === "boolean") {
        return cellValue === searchQuery;
      }

      return containsAllSubstrings(String(cellValue).trim().toLowerCase(), toSearchTermsArray(searchQuery as string));
    });
  });
});

const toSearchTermsArray = (str: string): string[] => str.trim().toLowerCase().split(/\s+/);

/**
 * Checks if a string A contains a list of all substrings.
 * @param str
 * @param substrings
 */
const containsAllSubstrings = (str: string, substrings: string[]): boolean => substrings.every(sub => str.indexOf(sub) !== -1);

const totalPages = computed(() => {
  if (pageSizeToNumber.value === -1) {
    return 1; // All items fit in one page
  }
  return Math.ceil(filteredData.value.length / pageSize.value);
});

const currentPageRows = computed(() => {
  if (pageSizeToNumber.value === -1) {
    return filteredData.value; // Show all rows
  }
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : sortOrder.value === "desc" ? null : "asc";
    if (!sortOrder.value) {
      sortKey.value = null;
    }
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const handleCheckboxChange = (key: string) => {
  if (searchQueries.value[key] === true) {
    searchQueries.value[key] = false;
  } else {
    searchQueries.value[key] = true;
  }
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    emit("page-change", page); // Emit page change event
  }
};

const onPageSizeChange = () => {
  if (pageSizeToNumber.value !== -1) {
    emit("page-size-change", pageSize.value); // Emit page size change event
    currentPage.value = 1; // Reset to page 1 when page size changes
  } else {
    emit("page-size-change", -1); // Emit "all" for page size
  }
};
</script>

<style scoped lang="scss">
@use "@/assets/custom-bootstrap.scss" as bootstrap;

[data-bs-theme="light"] {
  .table .col-sorted {
    background-color: bootstrap.$light;
  }
}

[data-bs-theme="dark"], .table-rounded th, .table-rounded td {
  table, .table-rounded th,
  .table-rounded td {
    border: 1px solid bootstrap.$info;
  }

  .table .col-sorted {
    background-color: bootstrap.$primary;
  }

  table th {
    background-color: bootstrap.$primary !important;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.table-rounded {
  border-radius: 5px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
}

.table-rounded th,
.table-rounded td {
  border: 1px solid bootstrap.$secondary;
}

.table-rounded thead tr:first-child th:first-child {
  border-top-left-radius: 5px;
}

.table-rounded thead tr:first-child th:last-child {
  border-top-right-radius: 5px;
}

.table-rounded tbody tr:last-child td:first-child {
  border-bottom-left-radius: 5px;
}

.table-rounded tbody tr:last-child td:last-child {
  border-bottom-right-radius: 5px;
}

.search-container input {
  width: 100%;
  padding: 5px;
}

.search-container input[type="checkbox"] {
  width: auto;
}

/* Optional: Style for column headers with sorting functionality */
.column-header-label {
  cursor: pointer;
  display: inline-block;
}

.searchable-column {
  width: 100px;
}
</style>
