const Table = {
  enterprise: Symbol("enterprise"),
  department: Symbol("department"),
  worker: Symbol("worker"),
  training: Symbol("training"),
  user: Symbol("user"),
};

type TableType = keyof typeof Table;
