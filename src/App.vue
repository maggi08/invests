<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatPrice } from './utils/price';
let salary = ref(1000000);
let years = ref(10);
let percent = ref(20);
let investPercent = ref(25);
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

function changeCurrency(e: any) {
  console.log('changeCurrency', e);
  if (currency.value === '$') {
    salary.value = salary.value / 0.0021;
  } else {
    salary.value = salary.value * 0.0021;
  }
}

let calculations = computed(() => {
  let salaryGrowth = [];
  // let constantInvests = [];
  let invests = [];
  let currentSalary = salary.value;
  // let constInvestedSum = 0;

  let investedSum = 0;

  for (let i = 0; i < years.value; i++) {
    let year = startYear.value + i;
    let growth = getGrowth(percent.value);
    let investGrowth = getGrowth(investPercent.value);

    let risedSalary = Math.floor(currentSalary * growth);
    // const constInvestSum = salary.value * 0.1 * 12;
    let investSum = Math.floor(currentSalary * 0.1 * 12);

    // let risedConstInvest = Math.floor(
    //   (constInvestedSum + constInvestSum) * investGrowth
    // );

    let risedInvest = Math.floor((investedSum + investSum) * investGrowth);

    salaryGrowth.push(
      `${i + 1}. ${year}: 
      ${formatPrice(Math.floor(currentSalary))} 
      × ${Math.floor(growth)} 
      = ${formatPrice(risedSalary)} ${currency.value} 
      (${formatPrice(round(risedSalary))} ${currency.value})`
    );
    invests.push(
      `${i + 1}. ${year}: 
      (${formatPrice(investedSum)} + ${formatPrice(investSum)}) 
      × ${Math.floor(investGrowth)} = 
      ${formatPrice(risedInvest)} ${currency.value} 
      (${formatPrice(round(risedInvest))} ${currency.value})`
    );
    // constantInvests.push(
    //   `${i + 1}. ${year}:
    //   (${formatPrice(constInvestedSum)} + ${formatPrice(Math.floor(constInvestSum))})
    //   × ${investGrowth} =
    //   ${formatPrice(risedConstInvest)} ${currency.value}
    //   (${formatPrice(round(risedConstInvest))} ${currency.value})`
    // );

    currentSalary = Math.floor(currentSalary * growth);
    // constInvestedSum = risedConstInvest;
    investedSum = risedInvest;
  }

  return {
    salaryGrowth,
    invests,
    // constantInvests,
  };
});
</script>

<template>
  <main>
    <form action="">
      <label> Enter salary: <input v-model="salary" type="number" /> </label>
      <br />
      <label> For Years: <input v-model="years" type="number" /> </label>
      <br />
      <label>
        Salary Increase in %: <input v-model="percent" type="number" />
      </label>
      <br />
      <label>
        Invests Increase in %: <input v-model="investPercent" type="number" />
      </label>
      <br />
      <label> Start year: <input v-model="startYear" type="number" /> </label>
      <br />
      <label>
        $
        <input
          type="radio"
          value="$"
          v-model="currency"
          @input="changeCurrency"
      /></label>
      <label>
        ₸
        <input
          type="radio"
          value="₸"
          v-model="currency"
          @input="changeCurrency"
      /></label>
    </form>

    <h1>Monthly Salary - {{ formatPrice(Math.floor(salary)) }}</h1>
    <h2>Yearly Salary - {{ formatPrice(Math.floor(salary * 12)) }}</h2>

    <br />
    <br />

    <div class="calculations">
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
    </div>

    <br />
    <br />

    <!-- <div class="">
      Invests with constant 10% of salary by each year
      <p v-for="(i, idx) in calculations.constantInvests" :key="idx">
        {{ i }}
      </p>
    </div> -->
  </main>
</template>

<style scoped>
main {
  width: 100%;
}

.calculations {
  display: flex;
}
.calculations div {
  margin-right: 20px;
}

@media (max-width: 768px) {
  .calculations {
    flex-direction: column;
  }
}
</style>
