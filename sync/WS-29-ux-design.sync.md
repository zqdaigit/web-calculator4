# Sync Audit: WS-29 UX Design

* **Issue**: [WS-29](mention://issue/cacff4ce-e3fd-4437-b0f0-2bd8fb984bcb)
* **Parent Issue**: [WS-27](mention://issue/1f41ac3b-b4c6-4e74-a903-864fddf48233)
* **ArtifactKey**: simple-web-calculator
* **ChangeType**: create
* **Branch**: agent/agent/b0c45d5d

## Change Summary
* **Initial Release**: Created the initial interaction design for the simple web calculator.
* **Retry 1 Refinement**: Updated the design based on the sync conflict audit report to resolve 5 key areas:
  1. **Keyboard Key Completion**: Added `AC` and `[ ⌫ ]` (Backspace) keys.
  2. **Clear vs All Clear Semantics**: Distinguished `C` (clears current input) and `AC` (resets all states).
  3. **Division by Zero Exception Recovery**: Configured screen to display `Error`, locking all buttons except `AC` which serves as the unique recovery trigger.
  4. **Input Length & Precision**: Aligned input character limit to 12 characters and output precision to 10 decimal digits.
  5. **Responsive Breakpoints & Layouts**: Updated breakpoints (Mobile `<480px`, Tablet `480px-768px`, PC `>768px`), PC card max width to 400px centered, and specified collapsible/sliding side panel for Tablet/PC history.
* **Retry 2 Refinement**: Resolved the 7 MAJOR conflicts identified in the Retry 1 audit:
  1. **Input Length Definition**: Explicitly defined that the 12-character limit includes digits, the decimal point, and the negative sign `-`.
  2. **Scientific Notation & Overflow**: Corrected scientific notation threshold to absolute values `>1e15` and detailed the system-locking behavior (only `AC` can unlock) when safe integer overflow (`Error: Overflow`) occurs.
  3. **History Clicking Backfill**: Specified that clicking a history item only backfills its calculation result as `operand1` (rather than reloading the entire formula).
  4. **History Clearing Confirmation**: Added a secondary confirmation dialog layout and options (`[ 确认 ]` / `[ 取消 ]`) for clearing history.
  5. **Physical Key Feedback & Help Panel**: Detailed virtual key active state feedback (50ms transition and press feedback) for physical key triggers, and specified layout/content for the physical shortcut help guide modal.
  6. **Physical Shortcut Collection**: Aligned and documented the complete set of physical shortcuts (incorporating `%`, `Delete`, `Escape`, `c`).
  7. **Copy Toast Alignment**: Updated copying toast feedback text to "结果已复制到剪贴板" and defined its 2-second fade-out lifecycle.
* **Retry 3 Refinement**: Resolved the 3 MAJOR conflicts identified in the Retry 2 audit:
  1. **Scientific Notation Threshold Boundary**: Aligned the scientific notation display threshold exactly to `>= 1e15` (absolute value).
  2. **Physical Key Active Feedback的时序**: Unified the `.active` state feedback sequence to persist throughout the key press and immediately recover upon `KeyUp`.
  3. **Clear Key Shortcut Mapping**: Expanded the keyboard shortcut mapping for the Clear key (`C`) to support both lowercase `c` and uppercase `C`.

### Deliverables
* **Design File**: `designs/simple-web-calculator.ux.md`
