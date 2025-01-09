export type FlatObject = Record<string, string>;

export const serializeCache = <T extends object>(attributes: T): FlatObject => {
  const serializedObj: FlatObject = {};
  Object.entries(attributes).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      serializedObj[key] = String(value);
    } else if (value instanceof Date) {
      serializedObj[key] = String(value.getTime());
    } else if (typeof value === "object" && value !== null) {
      serializedObj[key] = JSON.stringify(value); // Serialize nested objects as JSON strings
    }
  });
  return serializedObj;
};

export const deserializeCache = <T extends object>(flatObject: FlatObject): T => {
  const deserializedObj: Partial<T> = {};
  Object.entries(flatObject).forEach(([key, value]) => {
    try {
      // objects
      const parsedValue = JSON.parse(value);
      deserializedObj[key as keyof T] = parsedValue as T[keyof T];
    } catch {
      // Date
      if (!isNaN(Date.parse(value))) {
        deserializedObj[key as keyof T] = new Date(parseInt(value, 10)) as T[keyof T];
      }
      //number
      else if (!isNaN(Number(value))) {
        deserializedObj[key as keyof T] = Number(value) as T[keyof T];
      }
      //boolean
      else if (value === "true" || value === "false") {
        deserializedObj[key as keyof T] = (value === "true") as T[keyof T];
      }
      //string
      else {
        deserializedObj[key as keyof T] = value as T[keyof T];
      }
    }
  });

  return deserializedObj as T;
};
