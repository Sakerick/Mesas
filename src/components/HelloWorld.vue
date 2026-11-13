<template>
  <div class="seating-app">
    <!-- Barra Superior de Estadísticas y Búsqueda -->
    <header class="top-bar">
      <div class="brand">
        <h1>Gestión de Mesas e Invitados</h1>
        <div class="stats-pills">
          <span class="pill">
            <strong>{{ totalGuests }}</strong> / {{ totalCapacity }} lugares
            ocupados
          </span>
          <span class="pill available">
            <strong>{{ totalCapacity - totalGuests }}</strong> disponibles
          </span>
        </div>
      </div>

      <div class="actions">
        <button @click="openImport" class="btn-secondary">Importar CSV</button>
        <button @click="openExportPreview" class="btn-secondary">
          Exportar CSV
        </button>
        <button @click="resetData" class="btn-danger-outline">Reiniciar</button>
        <input
          ref="csvFileInput"
          class="csv-file-input"
          type="file"
          accept=".csv,text/csv"
          @change="importCSV"
        />
      </div>
    </header>

    <div class="main-workspace">
      <!-- Plano Interactivo SVG -->
      <section class="map-container">
        <div class="legend">
          <span><i class="dot empty"></i> Vacía</span>
          <span><i class="dot partial"></i> Con lugares</span>
          <span><i class="dot full"></i> Llena</span>
        </div>

        <svg viewBox="0 0 980 630" class="floorplan-svg">
          <!-- Áreas estructurales del salón -->
          <rect
            x="10"
            y="10"
            width="960"
            height="610"
            fill="#ffffff"
            stroke="#cbd5e1"
            stroke-width="2"
          />

          <!-- Baños -->
          <rect
            x="10"
            y="10"
            width="180"
            height="55"
            fill="#f8fafc"
            stroke="#94a3b8"
          />
          <text x="100" y="42" text-anchor="middle" class="zone-label">
            BAÑOS
          </text>
          <rect x="155" y="45" width="35" height="20" fill="#0f172a" />

          <!-- Barra -->
          <polyline
            points="10,255 32,255 32,445 10,445"
            fill="none"
            stroke="#64748b"
            stroke-width="2"
          />
          <text
            x="18"
            y="350"
            text-anchor="middle"
            transform="rotate(-90 18 350)"
            class="zone-label-sm"
          >
            BARRA
          </text>

          <!-- Escenario y Pista -->
          <rect
            x="415"
            y="10"
            width="205"
            height="65"
            fill="#f1f5f9"
            stroke="#334155"
            stroke-width="2"
          />
          <text x="517" y="47" text-anchor="middle" class="zone-label">
            ESCENARIO
          </text>

          <rect
            x="415"
            y="75"
            width="205"
            height="335"
            fill="#f8fafc"
            stroke="#334155"
            stroke-width="2"
          />
          <text x="517" y="245" text-anchor="middle" class="zone-label">
            PISTA
          </text>

          <!-- Muro inferior, Rampa y Fuente -->
          <line
            x1="295"
            y1="565"
            x2="395"
            y2="565"
            stroke="#334155"
            stroke-width="2"
          />
          <line
            x1="425"
            y1="565"
            x2="585"
            y2="565"
            stroke="#334155"
            stroke-width="2"
          />
          <line
            x1="615"
            y1="565"
            x2="970"
            y2="565"
            stroke="#334155"
            stroke-width="2"
          />

          <!-- Fuente -->
          <rect
            x="95"
            y="515"
            width="165"
            height="105"
            fill="none"
            stroke="#64748b"
            stroke-width="1.5"
          />
          <rect
            x="148"
            y="575"
            width="60"
            height="22"
            rx="6"
            fill="#f1f5f9"
            stroke="#64748b"
          />
          <text x="178" y="590" text-anchor="middle" class="zone-label-xs">
            FUENTE
          </text>

          <!-- Rampa -->
          <text x="278" y="560" text-anchor="middle" class="zone-label-xs">
            R
          </text>
          <text x="278" y="573" text-anchor="middle" class="zone-label-xs">
            A
          </text>
          <text x="278" y="586" text-anchor="middle" class="zone-label-xs">
            M
          </text>
          <text x="278" y="599" text-anchor="middle" class="zone-label-xs">
            P
          </text>
          <text x="278" y="612" text-anchor="middle" class="zone-label-xs">
            A
          </text>

          <!-- Renderizado de Mesas -->
          <g
            v-for="table in tables"
            :key="table.id"
            class="table-node"
            :class="{
              selected: selectedTableId === table.id,
            }"
            @click="selectTable(table.id)"
          >
            <!-- Redonda (10) -->
            <circle
              v-if="table.type === 'redonda'"
              :cx="table.x"
              :cy="table.y"
              r="20"
              :fill="getTableFill(table)"
              :stroke="getTableStroke(table)"
              stroke-width="2"
            />

            <!-- Cuadrada (12) -->
            <rect
              v-else-if="table.type === 'cuadrada'"
              :x="table.x - 19"
              :y="table.y - 19"
              width="38"
              height="38"
              rx="3"
              :fill="getTableFill(table)"
              :stroke="getTableStroke(table)"
              stroke-width="2"
            />

            <!-- Rectangular (14) -->
            <rect
              v-else-if="table.type === 'rectangular'"
              :x="table.x - table.w / 2"
              :y="table.y - table.h / 2"
              :width="table.w"
              :height="table.h"
              rx="3"
              :fill="getTableFill(table)"
              :stroke="getTableStroke(table)"
              stroke-width="2"
            />

            <!-- Circular Grande / Dona (22) -->
            <g v-else-if="table.type === 'circular_grande'">
              <circle
                :cx="table.x"
                :cy="table.y"
                r="45"
                :fill="getTableFill(table)"
                :stroke="getTableStroke(table)"
                stroke-width="2"
              />
              <circle
                :cx="table.x"
                :cy="table.y"
                r="18"
                fill="#ffffff"
                :stroke="getTableStroke(table)"
                stroke-width="1.5"
              />
            </g>

            <!-- Serpiente (24) -->
            <path
              v-else-if="table.type === 'serpiente'"
              :d="getSnakePath(table.x, table.y, table.height)"
              :fill="getTableFill(table)"
              :stroke="getTableStroke(table)"
              stroke-width="2"
            />

            <!-- Número de Mesa -->
            <text
              :x="table.x"
              :y="table.y - 2"
              text-anchor="middle"
              dominant-baseline="middle"
              class="table-number"
            >
              {{ table.id }}
            </text>

            <!-- Contador ocupados/capacidad -->
            <text
              :x="table.x"
              :y="table.y + 10"
              text-anchor="middle"
              dominant-baseline="middle"
              class="table-count"
            >
              {{ getTableGuestCount(table) }}/{{ getTableCapacity(table) }}
            </text>
          </g>
        </svg>
      </section>

      <!-- Panel Lateral de Gestión de Mesa -->
      <aside class="sidebar">
        <div v-if="selectedTable" class="table-details">
          <div class="table-header">
            <div>
              <span class="badge">{{
                formatType(selectedTable.type, selectedCapacity)
              }}</span>
              <h2>Mesa #{{ selectedTable.id }}</h2>
            </div>
            <div class="capacity-box" :class="{ full: isSelectedFull }">
              {{ getTableGuestCount(selectedTable) }} / {{ selectedCapacity }}
            </div>
          </div>

          <form class="capacity-editor" @submit.prevent="saveCapacity">
            <label class="field-label" for="table-capacity">
              <span class="field-kicker">Configuración</span>
              <span>Capacidad de la mesa</span>
            </label>
            <div class="capacity-editor-controls">
              <div class="capacity-stepper">
                <input
                  id="table-capacity"
                  v-model.number="editedCapacity"
                  type="number"
                  max="100"
                  :min="getTableGuestCount(selectedTable)"
                  aria-describedby="capacity-error"
                  @input="capacityError = ''"
                />
                <div class="capacity-stepper-actions">
                  <button
                    type="button"
                    class="capacity-stepper-button"
                    aria-label="Aumentar capacidad"
                    :disabled="editedCapacity >= MAX_TABLE_CAPACITY"
                    @click="adjustCapacity(1)"
                  >
                    <span aria-hidden="true">⌃</span>
                  </button>
                  <button
                    type="button"
                    class="capacity-stepper-button"
                    aria-label="Disminuir capacidad"
                    :disabled="
                      editedCapacity <= getTableGuestCount(selectedTable)
                    "
                    @click="adjustCapacity(-1)"
                  >
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-secondary">Guardar</button>
            </div>
            <p v-if="capacityError" id="capacity-error" class="capacity-error">
              {{ capacityError }}
            </p>
          </form>

          <!-- Agregar graduados a la mesa -->
          <div class="graduate-field">
            <label class="field-label" for="graduate-name">
              <span class="field-kicker">Datos de la mesa</span>
              <span>Agregar graduado</span>
            </label>
            <input
              id="graduate-name"
              v-model.trim="newGraduateName"
              type="text"
              placeholder="Escribe el nombre completo"
              class="graduate-input"
            />
            <select
              v-model="newGraduateCareer"
              class="graduate-input"
              aria-label="Carrera del graduado"
            >
              <option v-for="career in CAREERS" :key="career" :value="career">
                {{ career }}
              </option>
            </select>
          </div>

          <form @submit.prevent="addGraduate" class="add-guest-form">
            <div class="guest-count-stepper">
              <input
                v-model.number="newGraduateGuestCount"
                type="number"
                min="0"
                :max="availableGuestCapacity"
                placeholder="Invitados (sin contar graduado)"
                aria-label="Cantidad de invitados"
              />
              <div class="capacity-stepper-actions">
                <button
                  type="button"
                  class="capacity-stepper-button"
                  aria-label="Aumentar invitados"
                  :disabled="newGraduateGuestCount >= availableGuestCapacity"
                  @click="adjustGuestCount(1)"
                >
                  <span aria-hidden="true">⌃</span>
                </button>
                <button
                  type="button"
                  class="capacity-stepper-button"
                  aria-label="Disminuir invitados"
                  :disabled="newGraduateGuestCount <= 0"
                  @click="adjustGuestCount(-1)"
                >
                  <span aria-hidden="true">⌄</span>
                </button>
              </div>
            </div>
            <button
              type="submit"
              :disabled="
                hasGraduate(newGraduateName) ||
                isSelectedFull ||
                !newGraduateName ||
                newGraduateGuestCount < 0 ||
                newGraduateGuestCount > availableGuestCapacity
              "
              class="btn-primary"
            >
              {{
                hasGraduate(newGraduateName)
                  ? "Graduado ya agregado"
                  : isSelectedFull && !hasGraduate(newGraduateName)
                    ? "Mesa Llena"
                    : "+ Agregar graduado"
              }}
            </button>
          </form>

          <div v-if="selectedTable.graduates.length" class="graduate-list">
            <div
              v-for="graduate in selectedTable.graduates"
              :key="graduate.id"
              class="graduate-row"
            >
              <div
                v-if="editingGraduateId === graduate.id"
                class="graduate-edit-fields"
              >
                <input
                  v-model.trim="editingGraduateName"
                  class="graduate-input"
                  type="text"
                  aria-label="Nombre del graduado"
                />
                <select
                  v-model="editingGraduateCareer"
                  class="graduate-input"
                  aria-label="Carrera del graduado"
                >
                  <option
                    v-for="career in CAREERS"
                    :key="career"
                    :value="career"
                  >
                    {{ career }}
                  </option>
                </select>
                <input
                  v-model.number="editingGraduateGuestCount"
                  class="guest-count-input"
                  type="number"
                  min="0"
                  max="100"
                  aria-label="Cantidad de invitados"
                />
                <small v-if="graduateEditError" class="capacity-error">
                  {{ graduateEditError }}
                </small>
              </div>
              <div v-else>
                <strong>{{ graduate.name || "Sin nombre" }}</strong>
                <span>{{ graduate.career || "Computación" }}</span>
                <label class="graduate-inclusion">
                  <input
                    v-model="graduate.includeGraduate"
                    type="checkbox"
                    :aria-label="`Incluir a ${graduate.name || 'este graduado'} en la mesa`"
                  />
                  <span>Incluir graduado en esta mesa</span>
                </label>
                <span>
                  {{ getGraduatePeopleCount(graduate) }} personas en esta mesa
                </span>
              </div>
              <div class="graduate-actions">
                <template v-if="editingGraduateId === graduate.id">
                  <button
                    type="button"
                    class="btn-secondary btn-small"
                    @click="saveGraduateEdit"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    class="btn-remove"
                    title="Cancelar edición"
                    @click="cancelGraduateEdit"
                  >
                    &times;
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="btn-edit"
                    title="Editar graduado e invitados"
                    @click="startGraduateEdit(graduate)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn-remove"
                    title="Quitar graduado de la mesa"
                    @click="removeGraduate(graduate.id)"
                  >
                    &times;
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Resumen de lugares -->
          <div class="guests-section">
            <h3>Lugares ocupados: {{ getTableGuestCount(selectedTable) }}</h3>

            <p class="empty-msg">
              {{
                isSelectedFull
                  ? "La mesa está completa."
                  : `${availableCapacity} lugares disponibles.`
              }}
            </p>
          </div>
        </div>

        <div v-else class="no-selection">
          <p>
            Haz clic en una mesa para seleccionarla. Vuelve a hacer clic para
            ver sus lugares.
          </p>
        </div>
      </aside>
    </div>

    <div
      v-if="showExportPreview"
      class="modal-backdrop"
      @click.self="showExportPreview = false"
    >
      <section
        class="csv-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-preview-title"
      >
        <button
          class="modal-close"
          type="button"
          aria-label="Cerrar vista previa del CSV"
          @click="showExportPreview = false"
        >
          &times;
        </button>
        <div class="modal-heading">
          <div>
            <span class="eyebrow">Antes de exportar</span>
            <h2 id="csv-preview-title">Vista previa del CSV</h2>
            <p>{{ csvPreviewRows.length - 1 }} filas listas para descargar.</p>
          </div>
        </div>

        <div class="csv-preview-table-wrapper">
          <table class="csv-preview-table">
            <thead>
              <tr>
                <th v-for="header in csvPreviewRows[0]" :key="header">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in csvPreviewRows.slice(1)"
                :key="rowIndex"
              >
                <td v-for="(value, columnIndex) in row" :key="columnIndex">
                  {{ value || "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="csv-preview-actions">
          <button
            type="button"
            class="btn-secondary btn-preview-cancel"
            @click="showExportPreview = false"
          >
            Cancelar
          </button>
          <button type="button" class="btn-primary" @click="exportCSV">
            Descargar CSV
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="showTableModal && selectedTable"
      class="modal-backdrop"
      @click.self="showTableModal = false"
    >
      <section
        class="table-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="`Mesa ${selectedTable.id}`"
      >
        <button
          class="modal-close"
          type="button"
          aria-label="Cerrar detalle de mesa"
          @click="showTableModal = false"
        >
          &times;
        </button>
        <div class="modal-heading">
          <div>
            <span class="eyebrow">Distribución de asientos</span>
            <h2>Mesa #{{ selectedTable.id }}</h2>
            <p>
              {{ formatType(selectedTable.type, selectedCapacity) }} ·
              {{ getTableGuestCount(selectedTable) }} de
              {{ selectedCapacity }} ocupados
            </p>
          </div>
          <span class="modal-status" :class="{ full: isSelectedFull }">{{
            isSelectedFull ? "Llena" : "Disponible"
          }}</span>
        </div>

        <div class="seat-map" :style="{ '--seat-count': selectedCapacity }">
          <div class="seat-table" :class="`shape-${selectedTable.type}`">
            <strong>{{ selectedTable.id }}</strong>
            <small
              >{{ getTableGuestCount(selectedTable) }}/{{
                selectedCapacity
              }}</small
            >
          </div>
          <span
            v-for="seat in selectedCapacity"
            :key="seat"
            class="seat"
            :class="{ occupied: seat <= getTableGuestCount(selectedTable) }"
            :style="seatPosition(seat, selectedCapacity)"
            :title="
              seat <= getTableGuestCount(selectedTable)
                ? 'Lugar ocupado'
                : 'Lugar disponible'
            "
            >{{ seat }}</span
          >
        </div>

        <div class="seat-legend">
          <span><i class="seat-key occupied"></i> Ocupado</span>
          <span><i class="seat-key"></i> Disponible</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { INITIAL_TABLES, TABLE_CAPACITIES } from "../data/tablesLayout";

const STORAGE_KEY = "evento_mesas_invitados_v1";
const MIN_TABLE_CAPACITY = 1;
const MAX_TABLE_CAPACITY = 100;
const CAREERS = ["Computación", "Mecatrónica"];

const tables = ref([]);
const selectedTableId = ref(null);
const newGraduateName = ref("");
const newGraduateCareer = ref(CAREERS[0]);
const newGraduateGuestCount = ref(0);
const editedCapacity = ref(0);
const capacityError = ref("");
const showTableModal = ref(false);
const showExportPreview = ref(false);
const csvFileInput = ref(null);
const editingGraduateId = ref(null);
const editingGraduateName = ref("");
const editingGraduateCareer = ref(CAREERS[0]);
const editingGraduateGuestCount = ref(0);
const graduateEditError = ref("");

function normalizeCareer(career) {
  return CAREERS.includes(career) ? career : CAREERS[0];
}

// Inicializar datos desde localStorage o plantilla base
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      tables.value = JSON.parse(saved).map((table) => ({
        ...table,
        capacity: normalizeCapacity(table.capacity, table.type),
        graduates: Array.isArray(table.graduates)
          ? table.graduates.map((graduate) => ({
              ...graduate,
              career: normalizeCareer(graduate.career),
              includeGraduate: graduate.includeGraduate !== false,
            }))
          : table.graduateName ||
              table.guestCount ||
              (table.guests || []).length
            ? [
                {
                  id: crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${table.id}-legacy`,
                  name: table.graduateName || "",
                  career: CAREERS[0],
                  guestCount: Math.min(
                    getCapacity(table.type),
                    Math.max(
                      0,
                      Number(table.guestCount) || (table.guests || []).length,
                    ),
                  ),
                  includeGraduate: true,
                },
              ]
            : [],
        guests: [],
      }));
      return;
    } catch (e) {
      console.error("Error leyendo datos guardados:", e);
    }
  }
  tables.value = INITIAL_TABLES.map((t) => ({
    ...t,
    capacity: getCapacity(t.type),
    graduates: [],
    guests: [],
  }));
});

// Guardar automáticamente cualquier cambio
watch(
  tables,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true },
);

const getCapacity = (type) => TABLE_CAPACITIES[type] || 10;

function normalizeCapacity(capacity, type) {
  const parsedCapacity = Number(capacity);
  return Number.isInteger(parsedCapacity) &&
    parsedCapacity >= MIN_TABLE_CAPACITY &&
    parsedCapacity <= MAX_TABLE_CAPACITY
    ? parsedCapacity
    : getCapacity(type);
}

function getTableCapacity(table) {
  return normalizeCapacity(table.capacity, table.type);
}

const selectedTable = computed(() =>
  tables.value.find((t) => t.id === selectedTableId.value),
);

const selectedCapacity = computed(() =>
  selectedTable.value ? getTableCapacity(selectedTable.value) : 0,
);

const isSelectedFull = computed(() =>
  selectedTable.value
    ? getTableGuestCount(selectedTable.value) >= selectedCapacity.value
    : false,
);

const totalCapacity = computed(() =>
  tables.value.reduce((acc, t) => acc + getTableCapacity(t), 0),
);

const totalGuests = computed(() =>
  tables.value.reduce((acc, t) => acc + getTableGuestCount(t), 0),
);

const availableCapacity = computed(() =>
  selectedTable.value
    ? Math.max(
        0,
        selectedCapacity.value - getTableGuestCount(selectedTable.value),
      )
    : 0,
);

const availableGuestCapacity = computed(() =>
  Math.max(
    0,
    availableCapacity.value - (hasGraduate(newGraduateName.value) ? 0 : 1),
  ),
);

const csvPreviewRows = computed(() => buildCSVRows());

function getGraduateKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasGraduate(name, graduates = selectedTable.value?.graduates || []) {
  const graduateKey = getGraduateKey(name);
  return graduateKey
    ? graduates.some(
        (graduate) => getGraduateKey(graduate.name) === graduateKey,
      )
    : false;
}

function getGraduatePeopleCount(graduate) {
  return (
    (Number(graduate.guestCount) || 0) +
    (graduate.includeGraduate !== false ? 1 : 0)
  );
}

function getTableGuestCount(table) {
  return (table.graduates || []).reduce(
    (total, graduate) => total + getGraduatePeopleCount(graduate),
    0,
  );
}

function selectTable(id) {
  const isSameTable = selectedTableId.value === id;
  selectedTableId.value = id;
  showTableModal.value = isSameTable;
  newGraduateName.value = "";
  newGraduateCareer.value = CAREERS[0];
  newGraduateGuestCount.value = 0;
  editedCapacity.value = getTableCapacity(
    tables.value.find((table) => table.id === id),
  );
  capacityError.value = "";
}

function saveCapacity() {
  if (!selectedTable.value) return;

  const capacity = Number(editedCapacity.value);
  const occupied = getTableGuestCount(selectedTable.value);
  if (
    !Number.isInteger(capacity) ||
    capacity < MIN_TABLE_CAPACITY ||
    capacity > MAX_TABLE_CAPACITY
  ) {
    capacityError.value = `La capacidad debe ser un número entero entre ${MIN_TABLE_CAPACITY} y ${MAX_TABLE_CAPACITY}.`;
    return;
  }
  if (capacity < occupied) {
    capacityError.value = `La capacidad no puede ser menor a los ${occupied} lugares ocupados.`;
    return;
  }

  selectedTable.value.capacity = capacity;
  editedCapacity.value = capacity;
  capacityError.value = "";
}

function adjustCapacity(amount) {
  if (!selectedTable.value) return;

  const minimum = getTableGuestCount(selectedTable.value);
  const current = Number(editedCapacity.value) || minimum;
  editedCapacity.value = Math.min(
    MAX_TABLE_CAPACITY,
    Math.max(minimum, current + amount),
  );
  capacityError.value = "";
}

function adjustGuestCount(amount) {
  const current = Number(newGraduateGuestCount.value) || 0;
  newGraduateGuestCount.value = Math.min(
    availableGuestCapacity.value,
    Math.max(0, current + amount),
  );
}

function addGraduate() {
  if (!selectedTable.value) return;
  if (hasGraduate(newGraduateName.value)) return;
  const count = Number(newGraduateGuestCount.value) || 0;
  if (
    !newGraduateName.value ||
    count < 0 ||
    count > availableGuestCapacity.value
  )
    return;

  selectedTable.value.graduates.push({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    name: newGraduateName.value,
    career: newGraduateCareer.value,
    guestCount: count,
    includeGraduate: true,
  });
  newGraduateName.value = "";
  newGraduateCareer.value = CAREERS[0];
  newGraduateGuestCount.value = 0;
}

function startGraduateEdit(graduate) {
  editingGraduateId.value = graduate.id;
  editingGraduateName.value = graduate.name || "";
  editingGraduateCareer.value = normalizeCareer(graduate.career);
  editingGraduateGuestCount.value = Number(graduate.guestCount) || 0;
  graduateEditError.value = "";
}

function cancelGraduateEdit() {
  editingGraduateId.value = null;
  editingGraduateName.value = "";
  editingGraduateCareer.value = CAREERS[0];
  editingGraduateGuestCount.value = 0;
  graduateEditError.value = "";
}

function saveGraduateEdit() {
  if (!selectedTable.value) return;

  const name = editingGraduateName.value.trim();
  const guestCount = Number(editingGraduateGuestCount.value);
  if (!name) {
    graduateEditError.value = "Escribe el nombre del graduado.";
    return;
  }
  if (!Number.isInteger(guestCount) || guestCount < 0) {
    graduateEditError.value =
      "Los invitados deben ser un número entero válido.";
    return;
  }

  const graduates = selectedTable.value.graduates.map((graduate) =>
    graduate.id === editingGraduateId.value
      ? { ...graduate, name, career: editingGraduateCareer.value, guestCount }
      : graduate,
  );
  const candidateTables = tables.value.map((table) =>
    table.id === selectedTable.value.id ? { ...table, graduates } : table,
  );
  const candidateTable = candidateTables.find(
    (table) => table.id === selectedTable.value.id,
  );

  if (
    getTableGuestCount(candidateTable, candidateTables) >
    getTableCapacity(candidateTable)
  ) {
    graduateEditError.value = `La mesa supera su capacidad de ${getTableCapacity(candidateTable)} lugares.`;
    return;
  }

  selectedTable.value.graduates = graduates;
  cancelGraduateEdit();
}

function removeGraduate(graduateId) {
  if (!selectedTable.value) return;
  if (editingGraduateId.value === graduateId) cancelGraduateEdit();
  selectedTable.value.graduates = selectedTable.value.graduates.filter(
    (graduate) => graduate.id !== graduateId,
  );
}

function openImport() {
  csvFileInput.value?.click();
}

function openExportPreview() {
  showExportPreview.value = true;
}

async function importCSV(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  try {
    const rows = parseCSV(await file.text());
    const headers = rows.shift()?.map((header) => normalizeCSVValue(header));
    const hasCareerColumn = headers?.[1] === "carrera";
    const peopleCountColumnIndex = hasCareerColumn ? 2 : 1;
    const hasTotalPeopleColumn =
      headers?.[peopleCountColumnIndex] === "total personas en mesa";
    const hasLegacyGuestColumn =
      headers?.[peopleCountColumnIndex] === "total invitados";
    const expectedHeaders = hasCareerColumn
      ? [
          "nombre del graduado",
          "carrera",
          hasTotalPeopleColumn
            ? "total personas en mesa"
            : "total invitados",
          "numero de mesa",
        ]
      : [
          "nombre del graduado",
          hasTotalPeopleColumn ? "total personas en mesa" : "total invitados",
          "numero de mesa",
        ];
    const includeGraduateColumn =
      headers?.[peopleCountColumnIndex + 2] === "incluye graduado";

    if (
      !headers ||
      (!hasTotalPeopleColumn && !hasLegacyGuestColumn) ||
      headers.length < expectedHeaders.length ||
      !expectedHeaders.every((header, index) => headers[index] === header)
    ) {
      throw new Error(
        "El CSV debe tener las columnas: Nombre del graduado, Carrera, Total Personas en Mesa, Numero de Mesa.",
      );
    }

    const importedGraduates = new Map();
    for (const row of rows) {
      if (row.every((value) => !value.trim())) continue;
      const name = row[0]?.trim() || "Sin nombre";
      const career =
        (hasCareerColumn ? row[1]?.trim() : undefined) || CAREERS[0];
      const totalPeople = Number(row[peopleCountColumnIndex]);
      const tableId = Number(row[peopleCountColumnIndex + 1]);
      const includeGraduate = includeGraduateColumn
        ? parseCSVBoolean(row[peopleCountColumnIndex + 2])
        : true;
      const guestCount = hasTotalPeopleColumn
        ? totalPeople - (includeGraduate ? 1 : 0)
        : totalPeople;
      const table = tables.value.find((item) => item.id === tableId);

      if (
        !table ||
        !Number.isInteger(totalPeople) ||
        totalPeople < 0 ||
        !Number.isInteger(guestCount) ||
        guestCount < 0 ||
        !CAREERS.includes(career) ||
        includeGraduate === null
      ) {
        throw new Error(
          `Fila inválida para la mesa ${row[peopleCountColumnIndex + 1] || "desconocida"}.`,
        );
      }

      if (name.toLowerCase() === "sin asignar" && totalPeople === 0) continue;
      if (!importedGraduates.has(tableId)) importedGraduates.set(tableId, []);
      importedGraduates.get(tableId).push({
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
        name,
        career,
        guestCount,
        includeGraduate,
      });
    }

    const importedTables = tables.value.map((table) => ({
      ...table,
      graduates: importedGraduates.get(table.id) || [],
    }));

    for (const [tableId] of importedGraduates) {
      const table = importedTables.find((item) => item.id === tableId);
      const total = getTableGuestCount(table);
      if (total > getTableCapacity(table)) {
        throw new Error(
          `La mesa ${tableId} supera su capacidad de ${getTableCapacity(table)} lugares.`,
        );
      }
    }

    if (
      !confirm(
        "La importación reemplazará la distribución actual. ¿Deseas continuar?",
      )
    )
      return;
    tables.value = tables.value.map((table) => ({
      ...table,
      graduates: importedGraduates.get(table.id) || [],
      guests: [],
    }));
    alert("CSV importado correctamente.");
  } catch (error) {
    alert(error.message || "No se pudo importar el CSV.");
  }
}

function normalizeCSVValue(value) {
  return String(value || "")
    .replace(/^\ufeff/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseCSVBoolean(value) {
  const normalized = normalizeCSVValue(value);
  if (["si", "sí", "true", "1"].includes(normalized)) return true;
  if (["no", "false", "0"].includes(normalized)) return false;
  return null;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function formatType(type, capacity = getCapacity(type)) {
  const labels = {
    redonda: "Redonda",
    cuadrada: "Cuadrada",
    rectangular: "Rectangular",
    circular_grande: "Circular Grande",
    serpiente: "Serpiente",
  };
  return `${labels[type] || type} (${capacity} pers.)`;
}

function seatPosition(seat, capacity) {
  const angle = ((seat - 1) / capacity) * 360 - 90;
  const radius = capacity > 18 ? 45 : 43;
  return {
    left: `${50 + Math.cos((angle * Math.PI) / 180) * radius}%`,
    top: `${50 + Math.sin((angle * Math.PI) / 180) * radius}%`,
  };
}

// Dibuja la silueta ondulada de las mesas tipo serpiente
function getSnakePath(cx, cy, h) {
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const w = 13;
  return `
    M ${cx - w} ${top}
    L ${cx + w} ${top}
    C ${cx + w + 8} ${top + h * 0.25}, ${cx + w - 8} ${top + h * 0.75}, ${cx + w} ${bot}
    L ${cx - w} ${bot}
    C ${cx - w - 8} ${top + h * 0.75}, ${cx - w + 8} ${top + h * 0.25}, ${cx - w} ${top}
    Z
  `;
}

function getTableFill(table) {
  const count = getTableGuestCount(table);
  const cap = getTableCapacity(table);
  if (count === 0) return "#ffffff";
  if (count >= cap) return "#fee2e2"; // Rojo claro (llena)
  return "#dcfce7"; // Verde claro (con disponibilidad)
}

function getTableStroke(table) {
  if (selectedTableId.value === table.id) return "#2563eb";
  const count = getTableGuestCount(table);
  const cap = getTableCapacity(table);
  if (count >= cap) return "#dc2626";
  if (count > 0) return "#16a34a";
  return "#334155";
}

function exportCSV() {
  const rows = csvPreviewRows.value;
  showExportPreview.value = false;
  const csvContent =
    "\ufeff" + rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const encodedUri = URL.createObjectURL(
    new Blob([csvContent], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "distribucion_invitados.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(encodedUri);
}

function buildCSVRows() {
  const rows = [
    [
      "Nombre del graduado",
      "Carrera",
      "Total Personas en Mesa",
      "Numero de Mesa",
      "Incluye Graduado",
    ],
  ];
  tables.value.forEach((t) => {
    if (t.graduates.length === 0) {
      rows.push(["Sin asignar", "", 0, t.id, "No"]);
      return;
    }
    t.graduates.forEach((graduate) => {
      rows.push([
        graduate.name || "Sin nombre",
        normalizeCareer(graduate.career),
        getGraduatePeopleCount(graduate),
        t.id,
        graduate.includeGraduate !== false ? "Sí" : "No",
      ]);
    });
  });
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function resetData() {
  if (confirm("¿Seguro que deseas borrar todos los invitados asignados?")) {
    tables.value = INITIAL_TABLES.map((t) => ({
      ...t,
      capacity: getCapacity(t.type),
      graduates: [],
      guests: [],
    }));
    localStorage.removeItem(STORAGE_KEY);
  }
}
</script>

<style scoped>
.seating-app {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #1e293b;
  background: #f1f5f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: #ffffff;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.brand h1 {
  font-size: 1.25rem;
  margin: 0;
}

.stats-pills {
  display: flex;
  gap: 0.5rem;
}

.pill {
  background: #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.pill.available {
  background: #dcfce7;
  color: #166534;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.csv-file-input {
  display: none;
}

.search-input {
  padding: 0.45rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  min-width: 230px;
}

.main-workspace {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
}

@media (max-width: 1024px) {
  .main-workspace {
    grid-template-columns: 1fr;
  }
}

.map-container {
  background: #ffffff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.legend {
  display: flex;
  gap: 1.25rem;
  font-size: 0.82rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1.5px solid #334155;
}
.dot.empty {
  background: #ffffff;
}
.dot.partial {
  background: #dcfce7;
  border-color: #16a34a;
}
.dot.full {
  background: #fee2e2;
  border-color: #dc2626;
}
.dot.highlight {
  background: #fef08a;
  border-color: #ca8a04;
}

.floorplan-svg {
  width: 100%;
  height: auto;
  max-height: 76vh;
  user-select: none;
}

.zone-label {
  font-size: 16px;
  font-weight: 700;
  fill: #475569;
  letter-spacing: 2px;
}

.zone-label-sm {
  font-size: 12px;
  font-weight: 700;
  fill: #64748b;
  letter-spacing: 2px;
}

.zone-label-xs {
  font-size: 10px;
  font-weight: 700;
  fill: #64748b;
}

.table-node {
  cursor: pointer;
  transition: transform 0.12s ease;
}

.table-node:hover {
  opacity: 0.85;
}

.table-node.selected > circle,
.table-node.selected > rect,
.table-node.selected > path,
.table-node.selected > g > circle:first-child {
  stroke-width: 3.5px;
}

.table-number {
  font-size: 11px;
  font-weight: 700;
  fill: #0f172a;
  pointer-events: none;
}

.table-count {
  font-size: 8.5px;
  font-weight: 600;
  fill: #475569;
  pointer-events: none;
}

/* Sidebar */
.sidebar {
  background: #ffffff;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.table-header h2 {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
}

.badge {
  font-size: 0.75rem;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.capacity-box {
  background: #dcfce7;
  color: #166534;
  font-weight: 700;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
}

.capacity-box.full {
  background: #fee2e2;
  color: #991b1b;
}

.capacity-editor {
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.capacity-editor-controls {
  display: flex;
  gap: 0.5rem;
}

.capacity-stepper,
.guest-count-stepper {
  display: flex;
  min-width: 0;
  position: relative;
  width: 100%;
}

.capacity-stepper input,
.guest-count-stepper input {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--ink);
  min-width: 0;
  padding: 0.55rem 2.2rem 0.55rem 0.75rem;
  width: 100%;
}

.capacity-stepper input::-webkit-inner-spin-button,
.capacity-stepper input::-webkit-outer-spin-button,
.guest-count-stepper input::-webkit-inner-spin-button,
.guest-count-stepper input::-webkit-outer-spin-button {
  margin: 0;
  opacity: 0;
}

.capacity-stepper-actions {
  border-left: 1px solid #cbd5e1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 2px);
  position: absolute;
  right: 1px;
  top: 1px;
  width: 1.8rem;
}

.capacity-stepper-button {
  align-items: center;
  background: #f2f7f3;
  border: 0;
  color: var(--teal);
  cursor: pointer;
  display: flex;
  flex: 1;
  font-size: 0.9rem;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.capacity-stepper-button:first-child {
  border-bottom: 1px solid #cbd5e1;
  border-radius: 0 5px 0 0;
}

.capacity-stepper-button:last-child {
  border-radius: 0 0 5px 0;
}

.capacity-stepper-button:hover:not(:disabled) {
  background: #d8eee4;
}

.capacity-stepper-button:focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: -2px;
  position: relative;
  z-index: 1;
}

.capacity-stepper-button:disabled {
  color: #a7b7b6;
  cursor: not-allowed;
}

.capacity-editor-controls .btn-secondary {
  flex: 0 0 auto;
}

.capacity-error {
  color: #b55748;
  font-size: 0.78rem;
  margin-top: 0.45rem;
}

.add-guest-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.add-guest-form input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
}

.guests-section h3 {
  font-size: 0.95rem;
  margin: 0 0 0.75rem;
  color: #475569;
}

.guest-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 45vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.guest-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.65rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.seat-num {
  font-weight: 700;
  color: #64748b;
  font-size: 0.85rem;
}

.guest-name {
  margin: 0;
  font-weight: 500;
  font-size: 0.92rem;
}

.guest-note {
  color: #64748b;
  font-size: 0.78rem;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem 0.4rem;
}

.btn-remove:hover {
  color: #dc2626;
}

.empty-msg,
.no-selection {
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem 1rem;
}

/* Visual refresh */
.seating-app {
  --ink: #172a3a;
  --muted: #647789;
  --line: #d7e1e4;
  --paper: #fffdf8;
  --mint: #d8eee4;
  --coral: #e87961;
  --teal: #1c7d76;
  color: var(--ink);
  background: #f4f0e8;
  background-image:
    linear-gradient(135deg, rgba(28, 125, 118, 0.06), transparent 42%),
    linear-gradient(315deg, rgba(232, 121, 97, 0.07), transparent 35%);
}

.top-bar {
  background: rgba(255, 253, 248, 0.94);
  border-bottom-color: var(--line);
  padding: 1.25rem clamp(1rem, 3vw, 2.5rem);
}

.brand h1,
.table-header h2,
.modal-heading h2 {
  color: var(--ink);
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: -0.02em;
}

.brand h1 {
  font-size: clamp(1.35rem, 2vw, 1.8rem);
}
.pill {
  background: #e7efec;
  border-radius: 6px;
  color: var(--muted);
}
.pill.available {
  background: var(--mint);
  color: #176458;
}
.search-input,
.graduate-input,
.add-guest-form input {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
}
.map-container,
.sidebar {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 16px 35px rgba(23, 42, 58, 0.06);
}
.legend,
.empty-msg,
.no-selection,
.guest-note {
  color: var(--muted);
}
.dot.partial {
  background: #bde2d1;
  border-color: #2b8a78;
}
.dot.full {
  background: #f3b4a7;
  border-color: #c85c4c;
}
.dot.highlight {
  background: #f4d98c;
  border-color: #bd8e2d;
}
.zone-label,
.zone-label-sm,
.zone-label-xs {
  fill: #537078;
}
.table-number {
  fill: #17333b;
}
.table-count {
  fill: #45646b;
}
.table-header {
  border-bottom-color: var(--line);
}
.badge {
  background: #d9efed;
  color: #1a6d68;
}
.capacity-box {
  background: var(--mint);
  color: #176458;
}
.capacity-box.full {
  background: #f7d5ce;
  color: #a34a3b;
}
.field-label {
  color: var(--muted);
  display: flex;
  flex-direction: column;
  font-size: 0.86rem;
  font-weight: 700;
  gap: 0.15rem;
  letter-spacing: 0.02em;
  margin-bottom: 0.5rem;
}
.graduate-field {
  background: #f2f7f3;
  border: 1px solid #d5e5dd;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 0.8rem;
}
.field-kicker {
  color: var(--teal);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.graduate-input {
  background: #fffdf8;
  border: 1px solid #b9d1c9;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.95rem;
  outline: none;
  padding: 0.72rem 0.8rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  width: 100%;
}
.graduate-input::placeholder {
  color: #93a6a7;
}
.graduate-input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(28, 125, 118, 0.14);
}
.graduate-list {
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.25rem 0 1rem;
  padding-top: 0.8rem;
}
.graduate-row {
  align-items: center;
  background: #f2f7f3;
  border: 1px solid #d5e5dd;
  border-radius: 7px;
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.7rem;
}
.graduate-row > div {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.graduate-edit-fields {
  flex: 1 1 auto;
  gap: 0.35rem !important;
  min-width: 0;
}
.graduate-edit-fields .graduate-input {
  padding: 0.45rem 0.55rem;
}
.guest-count-input {
  background: #fffdf8;
  border: 1px solid #b9d1c9;
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--ink);
  padding: 0.45rem 0.55rem;
  width: 7rem;
}
.graduate-actions {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 0.35rem;
  margin-left: 0.6rem;
}
.btn-small {
  font-size: 0.72rem;
  padding: 0.4rem 0.55rem;
}
.btn-edit {
  background: transparent;
  border: 0;
  color: var(--teal);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem;
}
.graduate-row strong {
  color: var(--ink);
  font-size: 0.86rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.graduate-row span {
  color: var(--muted);
  font-size: 0.75rem;
}
.graduate-inclusion {
  align-items: center;
  color: var(--teal);
  display: flex;
  font-size: 0.75rem;
  gap: 0.35rem;
  margin-top: 0.2rem;
}
.graduate-inclusion input {
  accent-color: var(--teal);
  height: 1rem;
  margin: 0;
  width: 1rem;
}
.graduate-row .btn-remove {
  flex: 0 0 auto;
  margin-left: 0.6rem;
}
.btn-primary,
.btn-secondary {
  background: var(--teal);
  border-color: var(--teal);
}
.btn-primary:disabled {
  background: #a7b7b6;
}
.btn-danger-outline {
  border-color: #e1a195;
  color: #b55748;
}
.guest-item {
  background: #f5f7f3;
  border-color: #e1e8e3;
}
.guest-name {
  color: var(--ink);
}
.btn-remove:hover {
  color: var(--coral);
}

.modal-backdrop {
  align-items: center;
  background: rgba(23, 42, 58, 0.48);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1rem;
  position: fixed;
  z-index: 10;
}
.table-modal {
  background: var(--paper);
  border: 1px solid #fff;
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(23, 42, 58, 0.25);
  max-width: 560px;
  padding: clamp(1.25rem, 4vw, 2rem);
  position: relative;
  width: 100%;
}
.modal-close {
  background: transparent;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  font-size: 1.8rem;
  line-height: 1;
  padding: 0.2rem;
  position: absolute;
  right: 1rem;
  top: 0.8rem;
}
.modal-heading {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  padding-right: 1.5rem;
}
.eyebrow {
  color: var(--teal);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.modal-heading h2 {
  font-size: 2rem;
  margin: 0.25rem 0;
}
.modal-heading p {
  color: var(--muted);
  font-size: 0.86rem;
}
.modal-status {
  background: var(--mint);
  border-radius: 4px;
  color: #176458;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.4rem 0.6rem;
}
.modal-status.full {
  background: #f7d5ce;
  color: #a34a3b;
}
.seat-map {
  aspect-ratio: 1.9;
  margin: 1.5rem auto 1rem;
  max-width: 440px;
  position: relative;
}
.seat-table {
  align-items: center;
  background: var(--mint);
  border: 2px solid var(--teal);
  color: var(--teal);
  display: flex;
  flex-direction: column;
  height: 92px;
  justify-content: center;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
}
.seat-table small {
  color: var(--muted);
  font-size: 0.7rem;
}
.shape-redonda,
.shape-circular_grande {
  border-radius: 50%;
  height: 112px;
  width: 112px;
}
.shape-cuadrada {
  border-radius: 5px;
}
.shape-serpiente {
  border-radius: 45%;
  height: 140px;
  width: 78px;
}
.seat {
  align-items: center;
  background: #fff;
  border: 2px solid #9bb9b4;
  border-radius: 50%;
  color: var(--muted);
  display: flex;
  font-size: 0.64rem;
  font-weight: 800;
  height: 25px;
  justify-content: center;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 25px;
}
.seat.occupied {
  background: var(--coral);
  border-color: var(--coral);
  color: #fff;
}
.seat-legend {
  border-top: 1px solid var(--line);
  color: var(--muted);
  display: flex;
  font-size: 0.76rem;
  gap: 1rem;
  padding-top: 0.9rem;
}
.seat-legend span {
  align-items: center;
  display: flex;
  gap: 0.35rem;
}
.seat-key {
  background: #fff;
  border: 2px solid #9bb9b4;
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  width: 10px;
}
.seat-key.occupied {
  background: var(--coral);
  border-color: var(--coral);
}

.csv-preview-modal {
  background: var(--paper);
  border: 1px solid #fff;
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(23, 42, 58, 0.25);
  max-width: 900px;
  padding: clamp(1.25rem, 4vw, 2rem);
  position: relative;
  width: 100%;
}
.csv-preview-table-wrapper {
  border: 1px solid var(--line);
  border-radius: 8px;
  margin-top: 1.25rem;
  max-height: min(60vh, 480px);
  overflow: auto;
}
.csv-preview-table {
  border-collapse: collapse;
  color: var(--ink);
  font-size: 0.82rem;
  min-width: 650px;
  width: 100%;
}
.csv-preview-table th,
.csv-preview-table td {
  border-bottom: 1px solid var(--line);
  padding: 0.6rem 0.7rem;
  text-align: left;
  white-space: nowrap;
}
.csv-preview-table th {
  background: #e7efec;
  color: var(--ink);
  font-size: 0.74rem;
  letter-spacing: 0.03em;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}
.csv-preview-table tbody tr:last-child td {
  border-bottom: 0;
}
.csv-preview-table tbody tr:nth-child(even) {
  background: rgba(242, 247, 243, 0.65);
}
.csv-preview-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
.btn-preview-cancel {
  background: transparent;
  color: var(--teal);
}

@media (max-width: 620px) {
  .actions,
  .search-input {
    width: 100%;
  }
  .actions > button {
    flex: 1;
  }
  .seat-map {
    aspect-ratio: 1.35;
  }
  .csv-preview-actions {
    flex-direction: column-reverse;
  }
  .csv-preview-actions button {
    width: 100%;
  }
}
</style>
