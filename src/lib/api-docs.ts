export const apiDocs = {
  title: "Shopper API",
  description:
    "All endpoints require the header x-api-key with your API key. Set SHOPPER_API_KEY in the environment; for local dev the default is dev-key-local-only.",
  endpoints: [
    {
      method: "GET",
      path: "/api/items",
      description: "List all items",
      response: { items: "Item[]" },
    },
    {
      method: "POST",
      path: "/api/items",
      description: "Create an item",
      body: { name: "string", category: "string (optional)", defaultStore: "string (optional)" },
      response: { item: "Item" },
    },
    {
      method: "GET",
      path: "/api/items/:id",
      description: "Get one item by id",
      response: { item: "Item" },
    },
    {
      method: "PATCH",
      path: "/api/items/:id",
      description: "Update item name, category, or defaultStore",
      body: { name: "string (optional)", category: "string (optional)", defaultStore: "string (optional)" },
      response: { item: "Item" },
    },
    {
      method: "DELETE",
      path: "/api/items/:id",
      description: "Delete an item (and remove from list, clear inventory notes)",
      response: { deleted: true },
    },
    {
      method: "POST",
      path: "/api/items/:id/inventory",
      description: "Add an inventory note for an item (e.g. \"5 packets\", \"Plenty\")",
      body: { note: "string" },
      response: { note: "InventoryNote" },
    },
    {
      method: "GET",
      path: "/api/list",
      description: "Get the shopping list (all list entries with item details)",
      response: { list: "(Item & ListEntry)[]" },
    },
    {
      method: "POST",
      path: "/api/list",
      description: "Add an item to the shopping list",
      body: { itemId: "string" },
      response: { entry: "ListEntry" },
    },
    {
      method: "DELETE",
      path: "/api/list?itemId=:itemId",
      description: "Remove an item from the list",
      response: { removed: true },
    },
    {
      method: "PATCH",
      path: "/api/list/:itemId/picked",
      description: "Mark item as picked up or not",
      body: { pickedUp: "boolean" },
      response: { entry: "ListEntry" },
    },
  ],
  types: {
    Item: { id: "string", name: "string", category: "string | null", defaultStore: "string | null", createdAt: "string" },
    ListEntry: { itemId: "string", pickedUp: "boolean", addedAt: "string" },
    InventoryNote: { id: "string", itemId: "string", note: "string", createdAt: "string" },
  },
};
