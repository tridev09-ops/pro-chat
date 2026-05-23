/**
 * Convert MongoDB documents to plain JSON serializable objects
 * This solves the "Objects with toJSON methods are not supported" error
 */
export function serializeData<T>(data: any): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as T;
  }

  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // Convert ObjectId to string
        if (value && typeof value === "object" && value._bsontype === "ObjectId") {
          serialized[key] = value.toString();
        } else if (Array.isArray(value)) {
          serialized[key] = value.map((item) => serializeData(item));
        } else if (value !== null && typeof value === "object") {
          serialized[key] = serializeData(value);
        } else {
          serialized[key] = value;
        }
      }
    }
    return serialized as T;
  }

  return data;
}
