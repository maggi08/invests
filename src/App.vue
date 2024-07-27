<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatPrice } from './utils/price';
let salary = ref(1000000);
let years = ref(10);
let percent = ref(20);
let startYear = ref(2024);
let currency = ref('₸');

function getGrowth(percent: number): number {
  return percent / 100 + 1;
}

function round(val: number) {
  if (val < 10000) return val;
  let len = `${val}`.length - 2;
  let zeros = `0`.repeat(len);
  let round = Number(`1${zeros}`);
  return Math.round(val / round) * round;
}

let calculations = computed(() => {
  let salaryGrowth = [];
  let constantInvests = [];
  let invests = [];

  let currentSalary = salary.value;
  let constInvestedSum = 0;

  let investedSum = 0;

  for (let i = 0; i < years.value; i++) {
    let year = startYear.value + i;
    let growth = getGrowth(percent.value);

    let risedSalary = Math.floor(currentSalary * growth);
    const constInvestSum = salary.value * 0.1 * 12;
    let investSum = Math.floor(currentSalary * 0.1 * 12);

    let risedConstInvest = Math.floor(
      (constInvestedSum + constInvestSum) * growth
    );

    let risedInvest = Math.floor((investedSum + investSum) * growth);

    salaryGrowth.push(
      `${year}: 
      ${formatPrice(currentSalary)} 
      × ${growth} 
      = ${formatPrice(risedSalary)} ${currency.value} 
      (${formatPrice(round(risedSalary))} ${currency.value})`
    );
    invests.push(
      `${year}: 
      (${formatPrice(investedSum)} + ${formatPrice(investSum)}) 
      × ${growth} = 
      ${formatPrice(risedInvest)} ${currency.value} 
      (${formatPrice(round(risedInvest))} ${currency.value})`
    );
    constantInvests.push(
      `${year}: 
      (${formatPrice(constInvestedSum)} + ${formatPrice(constInvestSum)}) 
      × ${growth} = 
      ${formatPrice(risedConstInvest)} ${currency.value} 
      (${formatPrice(round(risedConstInvest))} ${currency.value})`
    );

    currentSalary = Math.floor(currentSalary * growth);
    constInvestedSum = risedConstInvest;
    investedSum = risedInvest;
  }

  return {
    salaryGrowth,
    invests,
    constantInvests,
  };
});
</script>

<template>
  <main>
    <form action="">
      <label> Enter salary: <input v-model="salary" /> </label>
      <br />
      <label> For Years: <input v-model="years" /> </label>
      <br />
      <label> Salary Increase in %: <input v-model="percent" /> </label>
      <br />
      <label> Start year: <input v-model="startYear" /> </label>
      <br />
      <label> $ <input type="radio" value="$" v-model="currency" /></label>
      <label> ₸ <input type="radio" value="₸" v-model="currency" /></label>
    </form>

    <h1>Monthly Salary - {{ formatPrice(salary) }}</h1>
    <h2>Yearly Salary - {{ formatPrice(salary * 12) }}</h2>

    <br />
    <br />

    <div class="">
      Salary growth by {{ percent }}% each year
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

    <br />
    <br />

    <div class="">
      Invests with constant 10% of salary by each year
      <p v-for="(i, idx) in calculations.constantInvests" :key="idx">
        {{ i }}
      </p>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
}

.calculations {
  display: flex;
}
</style>
