General Rule:
When a task requires or modifying a user interface, you must use the tools available in the shadcn-ui MCP server.

Planning Rule:
When planning a UI build using shadcn:

1. Discover Assets: First, use list\_components() and list\_blocks() to see all available assets in the MCP server.
2. Map Request to Assets: Analyze the user's request and map the required UI elements to the available components and blocks.
3. Prioritize Blocks: You should prioritize using blocks (get\_block) wherever possible for common, complex UI patterns (e.g., login pages, calendars, dashboards). Blocks provide more structure and accelerate development. Use individual components (get\_component) for smaller, more specific needs.

Implementation Rule:
When implementing the UI:

1. Always Get a Demo First: Before using a component, you must call the get\_component\_demo(component\_name) tool. This is critical for understanding how the component is used, its required props, and its structure.
2. Retrieve the Code:

* For a single component, call get\_component(component\_name).
* For a composite block, call get\_block(block\_name).

3. Implement Correctly: Integrate the retrieved code into the application, customizing it with the necessary props and logic to fulfill the user's request.
