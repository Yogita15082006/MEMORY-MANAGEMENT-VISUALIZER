
document.addEventListener("DOMContentLoaded", function () {
    const memoryArea = document.getElementById("memory-area");
    const processInput = document.getElementById("process-name");
    const sizeInput = document.getElementById("process-size");
    const strategySelect = document.getElementById("allocation-strategy");
    const allocateBtn = document.getElementById("allocate-btn");
    const deallocateBtn = document.getElementById("deallocate-btn");
    const resetBtn = document.getElementById("reset-btn");
    const pageTableDiv = document.getElementById("page-table");
    const segmentTableDiv = document.getElementById("segment-table");
    const modeSelector = document.getElementById("mode");

    const BLOCK_SIZE = 4;  // Block size in KB
    let memory = new Array(20).fill(null); // Simulated memory blocks
    let pageTables = {};
    let segmentTables = {};

    function updatePageTable() {
        pageTableDiv.innerHTML = "";
        for (let proc in pageTables) {
            pageTables[proc].forEach(page => {
                const row = document.createElement("div");
                row.classList.add("page-entry");
                row.textContent = `${proc} → Page ${page.page} → Frame ${page.frame}`;
                pageTableDiv.appendChild(row);
            });
        }
    }

    function updateSegmentTable() {
        segmentTableDiv.innerHTML = "";
        for (let proc in segmentTables) {
            segmentTables[proc].forEach(seg => {
                const row = document.createElement("div");
                row.classList.add("page-entry");
                row.textContent = `${proc} - ${seg.name} → Block ${seg.block}`;
                segmentTableDiv.appendChild(row);
            });
        }
    }

    function renderMemory() {
        memoryArea.innerHTML = "";
        memory.forEach((block, index) => {
            const blockDiv = document.createElement("div");
            blockDiv.classList.add("memory-block");
            blockDiv.style.opacity = "0";
            setTimeout(() => blockDiv.style.opacity = "1", 100);

            if (block === null) {
                blockDiv.style.backgroundColor = "#2ecc71";
                blockDiv.textContent = "Free";
            } else if (block.page !== undefined) {
                blockDiv.style.backgroundColor = "#9b59b6";
                blockDiv.textContent = `${block.name} P${block.page}`;
            } else if (block.segment) {
                blockDiv.style.backgroundColor = "#f39c12";
                blockDiv.textContent = `${block.name} ${block.segment}`;
            }

            memoryArea.appendChild(blockDiv);
        });
    }

    allocateBtn.addEventListener("click", () => {
        const name = processInput.value.trim();
        const size = parseInt(sizeInput.value);
        const strategy = strategySelect.value;
        const mode = modeSelector.value;

        if (!name || isNaN(size) || size <= 0) return alert("Invalid input.");
        if (memory.some(b => b && b.name === name)) return alert("Process already exists.");

        if (mode === "paging") {
            const pages = Math.ceil(size / BLOCK_SIZE);
            const freeFrames = memory.reduce((acc, val, i) => val === null ? acc.concat(i) : acc, []);

            if (freeFrames.length < pages) {
                memoryArea.style.borderColor = "red";
                setTimeout(() => memoryArea.style.borderColor = "#bdc3c7", 1000);
                return alert("Not enough memory for paging.");
            }

            const pageTable = [];
            for (let p = 0; p < pages; p++) {
                const frame = freeFrames[p];
                memory[frame] = { name, page: p };
                pageTable.push({ page: p, frame });
            }
            pageTables[name] = pageTable;
            updatePageTable();
        } else {
            const segments = [
                { name: "Code", size: Math.ceil(size * 0.4 / BLOCK_SIZE) },
                { name: "Data", size: Math.ceil(size * 0.3 / BLOCK_SIZE) },
                { name: "Stack", size: Math.ceil(size * 0.3 / BLOCK_SIZE) }
            ];
            const allFree = memory.map((b, i) => b === null ? i : null).filter(i => i !== null);
            const segmentTable = [];

            for (let seg of segments) {
                let count = 0;
                for (let i = 0; i < memory.length && count < seg.size; i++) {
                    if (memory[i] === null) {
                        memory[i] = { name, segment: seg.name };
                        segmentTable.push({ name: seg.name, block: i });
                        count++;
                    }
                }
                if (count < seg.size) {
                    memoryArea.style.borderColor = "red";
                    setTimeout(() => memoryArea.style.borderColor = "#bdc3c7", 1000);
                    return alert("Not enough memory for segmentation.");
                }
            }

            segmentTables[name] = segmentTable;
            updateSegmentTable();
        }

        renderMemory();
        processInput.value = "";
        sizeInput.value = "";
    });

    deallocateBtn.addEventListener("click", () => {
        const name = processInput.value.trim();
        if (!name) return alert("Please provide a process name.");
        if (!pageTables[name] && !segmentTables[name]) return alert("Process not found.");

        if (pageTables[name]) {
            pageTables[name].forEach(page => memory[page.frame] = null);
            delete pageTables[name];
            updatePageTable();
        }
        if (segmentTables[name]) {
            segmentTables[name].forEach(seg => memory[seg.block] = null);
            delete segmentTables[name];
            updateSegmentTable();
        }
        renderMemory();
        processInput.value = "";
    });

    resetBtn.addEventListener("click", () => {
        memory = new Array(20).fill(null);
        pageTables = {};
        segmentTables = {};
        updatePageTable();
        updateSegmentTable();
        renderMemory();
        memoryArea.style.borderColor = "#bdc3c7";
        alert("Memory has been reset.");
    });

    renderMemory();
});
