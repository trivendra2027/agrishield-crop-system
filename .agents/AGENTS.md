# Workspace Rules & Agent Constraints

## Browser Testing & Input Interaction
- **Clear Inputs Before Typing:** Whenever performing browser automation or scratchpad testing, always verify if the input fields are pre-filled. If an input field already contains text or a value, select all content and delete it (or backspace to clear it entirely) before typing the new value. This prevents double-typing or appending text onto existing entries.
- **Hard Reload During Browser Testing:** Whenever performing browser automation or scratchpad verification, press `Ctrl + Shift + R` (or `Control+F5` / hard reload) to bypass cached Service Worker assets and load the latest live site build immediately.

## Persistent Changelog Updates
- **Record Every Change:** Whenever you modify any code, architecture, or configuration in this workspace, you MUST append a brief summary of the changes to the `changes_happening.md` file in the root directory. Do not forget this rule under any circumstances to prevent the user from losing track of their 15+ hours of work.
