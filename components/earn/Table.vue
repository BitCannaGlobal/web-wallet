<template>
  <div class="container2">
    <h1>Pooling</h1>
    <table class="tableearn">
      <thead>
        <tr>
          <th class="cell">Stake</th>
          <th class="cell"></th>
          <th class="cell">Lockup</th>
          <th class="cell">TVL</th>
          <th class="cell">APR</th>
          <th class="cell"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell">BCNA/ATOM</td>
          <td class="cell"><img src="icon/bcna-cosmos.png" /></td>
          <td class="cell">1-7-14 days</td>
          <td class="cell">$4.14M</td>
          <td class="cell">O% Annualised</td>
          <td class="cell">
            <CommonButton
              :href="network.osmosAppUrl + '/pool/572'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
        <tr>
          <td class="cell">BCNA/OSMOS</td>
          <td class="cell"><img src="icon/bcna-osmos.png" /></td>
          <td class="cell">1-7-14 days</td>
          <td class="cell">$3.87M</td>
          <td class="cell">O% Annualised</td>
          <td class="cell">
            <CommonButton
              :href="network.osmosAppUrl + '/pool/571'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <h1>Stake</h1>
    <table class="tableearn">
      <thead>
        <tr>
          <th class="cell index">Stake</th>
          <th class="cell"></th>
          <th class="cell">Lockup</th>
          <th class="cell">TVL</th>
          <th class="cell">APR</th>
          <th class="cell"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell">Bitcanna delegate</td>
          <td class="cell"><img src="icon/bcna.png" /></td>
          <td class="cell">14 days</td>
          <td class="cell">$4.14M</td>
          <td class="cell">O% Annualised</td>
          <td class="cell">
            <CommonButton
              :href="validators"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
        <tr>
          <td class="cell">Bitcanna validate</td>
          <td class="cell"><img src="icon/bcna.png" /></td>
          <td class="cell">NA</td>
          <td class="cell">$3.87M</td>
          <td class="cell">O% Annualised</td>
          <td class="cell">
            <CommonButton
              :href="'https://docs.bitcanna.io/guides/validator-setup-guide'"
              value="Start earning"
              :link="true"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import network from '~/network'

export default {
  name: `PageSwap`,
  data: () => ({
    network,
  }),
}
</script>

<style>
.container2 {
  /* overflow: auto; */
  border-radius: var(--border-radius);
  background: var(--gray-1100);
}
.icon {
  display: inline-flex;
  align-self: center;
}

.tableearn {
  table-layout: auto;
  min-width: 100%;
  border-radius: 30px;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: -10px;
}
.tableearn th {
  padding: 1rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.tableearn td {
  vertical-align: middle;
  border: solid 1px #000;
  border-style: solid none;
  padding: 25px;
  background-color: black;
}
.tableearn td:first-child {
  border-left-style: solid;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
.tableearn td:last-child {
  border-right-style: solid;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
}

/*
th {
  padding: 1rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  background: black;
}
td.cell {
  padding: 1rem 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  vertical-align: middle;
  background: black;
  border: 4px solid var(--gray-1100);
} */

/*
table {
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: -10px;
}
td {
  border: solid 1px #000;
  border-style: solid none;
  padding: 10px;
  background-color: cyan;
}
td:first-child {
  border-left-style: solid;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
td:last-child {
  border-right-style: solid;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
} */
</style>
