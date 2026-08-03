import { showDetail } from './script.js';

// --- 2. 仮想リスト描画ロジック ---
export default function renderVirtualList(filteredData) {
    const ITEM_HEIGHT = 50; // CSSの.staff-itemの高さと合わせる
    const VISIBLE_RANGE = 4; // 真ん中から上下に表示する個数
    const staffList = document.getElementById('staffList'); // 要素を明示的に取得
    
    if (!staffList) return;

    const scrollTop = staffList.scrollTop;
    const containerHeight = staffList.clientHeight;
    const centerIndex = Math.floor((scrollTop + containerHeight / 2) / ITEM_HEIGHT);
    
    let startIndex = Math.max(0, centerIndex - VISIBLE_RANGE);
    let endIndex = Math.min(filteredData.length, centerIndex + VISIBLE_RANGE + 1);

    const paddingTop = startIndex * ITEM_HEIGHT;
    const paddingBottom = (filteredData.length - endIndex) * ITEM_HEIGHT;
    const visibleData = filteredData.slice(startIndex, endIndex);
    
    staffList.innerHTML = '';
    
    const spacerTop = document.createElement('div');
    spacerTop.style.height = `${paddingTop}px`;
    staffList.appendChild(spacerTop);

    visibleData.forEach((staff) => {
        const li = document.createElement('li');
        li.className = 'staff-item';
        
        if (staff.dept.includes("部長")) {
            li.classList.add('highlight-executive');
        } else if (staff.dept.includes("委員長")) {
            li.classList.add('highlight-committee');
        }

        if (staff.graduationed) {
            li.classList.remove("highlight-executive", "highlight-committee");
            li.classList.add('highlight-graduationed');
        }

        li.style.height = `${ITEM_HEIGHT}px`;
        li.innerHTML = `
            <span>${staff.name}</span>
            <span class="id-tag">
                ${staff.graduationed ? "G-" : ""}${staff.id}
            </span>
        `;
        li.addEventListener('click', () => {
            showDetail(staff);
        });
        staffList.appendChild(li);
    });

    const spacerBottom = document.createElement('div');
    spacerBottom.style.height = `${paddingBottom}px`;
    staffList.appendChild(spacerBottom);
};