<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { formatPrice, round } from './utils/price';
import { useKZTtoUSD } from './utils/useKZTtoUSD';

const { convertCurrency, Currency } = useKZTtoUSD();
let salary = ref(1000000);
let years = ref(12);
let salaryGrowthPercent = ref(50);
let investGrowthPercent = ref(25);
let investPercent = ref(10);
let startYear = ref(2024);
let currency = ref(Currency.kzt);

function getGrowth(percent: number): number {
  return percent / 100 + 1;
}

function changeCurrency() {
  salary.value = convertCurrency(salary.value, currency.value);
}

let reverseCurrency = computed(() => {
  return currency.value === '$' ? '₸' : '$';
});

let calculations = computed(() => {
  let salaryGrowth = [];
  let invests = [];
  let currentSalary = salary.value;

  let investedSum = 0;

  for (let i = 0; i < years.value; i++) {
    let year = startYear.value + i;
    let growth = getGrowth(salaryGrowthPercent.value);
    let investGrowth = getGrowth(investGrowthPercent.value);

    let risedSalary = Math.floor(currentSalary * growth);
    let investSum = Math.floor(
      ((currentSalary * investPercent.value) / 100) * 12
    );

    let risedInvest = Math.floor((investedSum + investSum) * investGrowth);

    salaryGrowth.push(
      `${i + 1}. ${year}:
      ${formatPrice(Math.floor(currentSalary))}
      × ${growth}
      = ${formatPrice(risedSalary)} ${currency.value}
      (${formatPrice(round(risedSalary))} ${currency.value})`
    );
    invests.push(
      `${i + 1}. ${year}:
      (${formatPrice(investedSum)} + ${formatPrice(investSum)})
      × ${investGrowth} =
      ${formatPrice(risedInvest)} ${currency.value}
      (${formatPrice(round(risedInvest))} ${currency.value})`
    );

    currentSalary = Math.floor(currentSalary * growth);
    investedSum = risedInvest;
  }

  return {
    salaryGrowth,
    invests,
  };
});
</script>

<template>
  <main>
    <div class="form">
      <div class="">
        <label> Enter salary: <input v-model="salary" type="number" /> </label>
        <br />
        <label> For Years: <input v-model="years" type="number" /> </label>
        <br />
        <label>
          Salary Increase in %:
          <input v-model="salaryGrowthPercent" type="number" />
        </label>
        <br />
        <label>
          Invests Increase in %:
          <input v-model="investGrowthPercent" type="number" />
        </label>
        <br />
        <label>
          Percent of invests from salary %:
          <input v-model="investPercent" type="number" />
        </label>
        <br />
        <label> Start year: <input v-model="startYear" type="number" /> </label>
        <br />
        <label>
          Currency $
          <input
            type="radio"
            value="$"
            v-model="currency"
            @input="changeCurrency"
          />
          ₸
          <input
            type="radio"
            value="₸"
            v-model="currency"
            @input="changeCurrency"
          />
        </label>
      </div>

      <div class="">
        <h1>
          Monthly Salary - {{ formatPrice(Math.floor(salary)) }}
          {{ currency }} - {{ formatPrice(convertCurrency(salary, currency)) }}
          {{ reverseCurrency }}
        </h1>
        <h2>
          Yearly Salary - {{ formatPrice(Math.floor(salary * 12)) }}
          {{ currency }} - {{ formatPrice(convertCurrency(salary, currency)) }}
          {{ reverseCurrency }}
        </h2>
      </div>
    </div>

    <br />
    <br />

    <div class="calculations">
      <div class="">
        Salary growth by {{ salaryGrowthPercent }}% each year
        <p v-for="(i, idx) in calculations.salaryGrowth" :key="idx">
          {{ i }}
        </p>
      </div>

      <br />
      <br />
      <div class="">
        Invests with 10% of salary by each year
        <p v-for="(i, idx) in calculations.invests" :key="idx">
          {{ i }}
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
}
.calculations {
  display: flex;
}
.calculations div,
.form div {
  margin-right: 20px;
}

@media (max-width: 768px) {
  .calculations,
  .form {
    flex-direction: column;
  }
}
</style>
