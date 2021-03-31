# Express Rest API

### Run

```sh
yarn install
yarn up
```

E2E test performance on a 2016 MBP (2,6 GHz Quad-Core Intel Core i7, 16 GB 2133 MHz LPDDR3):

```sh
➜ UV_THREADPOOL_SIZE=16 NODE_ENV=production 0x -P 'autocannon -c 40 http://127.0.0.1:3000/user/uuid-fake' out/main.js
🔥  Profiling
server listening on http://localhost:3000
Running 10s test @ http://127.0.0.1:3000/user/uuid-fake
40 connections

┌─────────┬──────┬──────┬───────┬───────┬────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg    │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼───────┼────────┼─────────┼───────┤
│ Latency │ 5 ms │ 5 ms │ 14 ms │ 19 ms │ 6.3 ms │ 2.92 ms │ 51 ms │
└─────────┴──────┴──────┴───────┴───────┴────────┴─────────┴───────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 2757   │ 2757   │ 6255    │ 6911    │ 5944.7  │ 1271.05 │ 2756   │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 753 kB │ 753 kB │ 1.71 MB │ 1.89 MB │ 1.62 MB │ 347 kB  │ 752 kB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.
```
