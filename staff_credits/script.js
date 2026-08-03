import { decompressBrotli } from '../js/brotli.js';
import renderVirtualList from './renderVirtualList.js';

let isBot = true;
let allStaffData = []; 
let filteredData = []; // 検索結果を含めた「現在表示すべき全データ」
let NotGraduationedData = [];
let allStaffDataLength = 0;
let NotGraduationedDataLength = 0;

if (typeof window === 'undefined') {
    isBot = true;
}

const ua = navigator.userAgent;
const bot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);
isBot = bot;

export const showDetail = (staff) => {
    const staffDetail = document.getElementById('staffDetail');
    const staffList = document.getElementById('staffList');

    if (!staffDetail || !staffList) return;

    staffDetail.classList.remove('highlight-executive-detail', 'highlight-committee-detail', 'highlight-graduationed-detail');
    
    if (staff.dept.includes("部長")) {
        staffDetail.classList.add('highlight-executive-detail');
    } else if (staff.dept && staff.dept.includes("委員長")) {
        staffDetail.classList.add('highlight-committee-detail');
    }

    if (staff.graduationed) {
        staffDetail.classList.remove('highlight-executive-detail', 'highlight-committee-detail');
        staffDetail.classList.add('highlight-graduationed-detail');
    }

    document.getElementById('detailId').textContent = staff.id;
    document.getElementById('detailName').textContent = staff.name;
    document.getElementById('detailKana').textContent = staff.kana;
    document.getElementById('detailDept').textContent = staff.dept;
    document.getElementById('detailLocation').textContent = staff.location;
    document.getElementById('detailSeat').textContent = staff.seat;
    document.getElementById('detailJoined').textContent = staff.joined;
    document.getElementById('detailTeam').textContent = staff.team;

    // 表示制御用サブ関数
    const setOptionalSection = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        const parent = el.closest('p'); 
        
        if (value && String(value).trim() !== "") {
            el.textContent = value;
            if (parent) parent.style.display = 'block'; 
        } else {
            if (parent) parent.style.display = 'none';  
        }
    };

    // オプション項目の反映
    setOptionalSection('detailBirthday', staff.birthday);
    setOptionalSection('detailIntro', staff.intro);
    setOptionalSection('detailComment', staff.comment);
    setOptionalSection('detailGraduationed', staff.graduationed);

    staffDetail.style.display = 'block';
    staffList.style.display = 'none';
};

const dataInitializationPromise = (async () => {
    const url = new URL(window.location.href);
    let session = JSON.parse(localStorage.getItem("session") || '{}');
    const loginParams = url.searchParams.get("login") || session.loginParams;
    
    let res0 = { ok: false };
    let isLogined = false;
    let isAdmin = false;

    if (typeof session.date === "undefined") session.date = new Date().getTime();

    try {
        if ((session.date + 36e5) > new Date().getTime() && loginParams) {
            const headers = new Headers();
            headers.set("Authorization", `Bearer ${loginParams}`);
            const res = await fetch("https://asakura-wiki.vercel.app/api/accounts/login_check", { headers });
            const data = await res.json();
            isLogined = data.success;
            isAdmin = data.isAdmin;
        }

        if (isAdmin) {
            const headers = new Headers();
            headers.set("Authorization", loginParams);
            res0 = await fetch("https://asakura-wiki.vercel.app/api/staff_credits", { headers });
        }

        if (!isLogined && !isBot) {
            localStorage.removeItem("session");
            return { error401: true };
        }

        localStorage.setItem("session", JSON.stringify({loginParams, date: new Date().getTime()}));

        if (res0.ok) {
            const data = await res0.arrayBuffer();
            const decompressed = await decompressBrotli(new Uint8Array(data));
            allStaffData = JSON.parse(decompressed);
            const blob = new Blob([
                new TextEncoder().encode(
                    JSON.stringify(allStaffData)
                )
            ], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            console.log("allStaffData: ", url);
        } else {
            const [res1, res2, res3, res4, res5] = await Promise.all([
                fetch('staff_data_1_64.json.br'),
                fetch('staff_data_65_128.json.br'),
                fetch('staff_data_129_192.json.br'),
                fetch('staff_data_193_256.json.br'),
                fetch('staff_data_257_320.json.br')
            ]);

            if (!res1.ok || !res2.ok || !res3.ok || !res4.ok || !res5.ok) throw new Error("ファイルの取得に失敗しました");

            const [buf1, buf2, buf3, buf4, buf5] = await Promise.all([
                res1.arrayBuffer(),
                res2.arrayBuffer(),
                res3.arrayBuffer(),
                res4.arrayBuffer(),
                res5.arrayBuffer()
            ]);

            const [jsonStr1, jsonStr2, jsonStr3, jsonStr4, jsonStr5] = Promise.all([
                decompressBrotli(buf1),
                decompressBrotli(buf2),
                decompressBrotli(buf3),
                decompressBrotli(buf4),
                decompressBrotli(buf5),
            ]);

            allStaffData = [
                ...JSON.parse(jsonStr1).staff_data,
                ...JSON.parse(jsonStr2).staff_data,
                ...JSON.parse(jsonStr3).staff_data,
                ...JSON.parse(jsonStr4).staff_data,
                ...JSON.parse(jsonStr5).staff_data
            ];
            
        }
        filteredData = allStaffData;
        allStaffDataLength = allStaffData.length;
        NotGraduationedData = allStaffData.filter(value => !value.graduationed);
        NotGraduationedDataLength = NotGraduationedData.length;
        return { success: true };

    } catch (error) {
        console.error("データ読み込みエラー:", error);
        return { success: false };
    }
})();

function updateStaffCounter(allStaffDataCounter, checked) {
    if (allStaffDataCounter) {
        if (checked) {
            allStaffDataCounter.textContent = allStaffDataLength;
        } else {
            allStaffDataCounter.textContent = NotGraduationedDataLength;
        }
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const staffList = document.getElementById('staffList');
    const staffListHidden = document.getElementById("staffList-hidden");
    const noResult = document.getElementById('noResult');
    const staffDetail = document.getElementById('staffDetail');
    const closeDetail = document.getElementById('closeDetail');
    const allStaffDataCounter = document.getElementById('allStaffDataCounter');
    const checkbox = document.getElementById("is_graduationed_view");

    const currentUrl = new URL(window.location.href);
    const targetId = currentUrl.searchParams.get("id");

    const initResult = await dataInitializationPromise;

    if (initResult && initResult.error401) {
        document.body.style.display = "block";
        document.body.style.textAlign = "center";
        document.body.innerHTML = `
        <h1>Error 401 unauthorized.</h1>
        <p><a href="https://asakura-wiki.vercel.app/login">認証して下さい。</a></p>
        `;
        return;
    }

    // Bot用隠しリストの生成
    if (staffListHidden && allStaffData) {
        staffListHidden.textContent = JSON.stringify(allStaffData);
    }

    if (targetId && allStaffData.length > 0) {
        // スタッフデータ内の id とパラメータの文字列を比較して一致するものを探す
        const matchedStaff = allStaffData.find(staff => String(staff.id) === String(targetId).trim());
        if (matchedStaff) {
            showDetail(matchedStaff);
        }
    }

    try {
        history.replaceState(
            { path: "https://sakitibi.github.io/14nin.com/staff_credits/" },
            "",
            "https://sakitibi.github.io/14nin.com/staff_credits/"
        );
    } catch(e) {
        console.error("Error: ", e);
    }

    if (staffList) {
        staffList.addEventListener('scroll', () => renderVirtualList(filteredData));
    }

    if (searchInput && staffDetail && noResult && staffList) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            staffDetail.style.display = 'none';

            if (query === "") {
                filteredData = allStaffData;
            } else {
                filteredData = allStaffData.filter(staff => 
                    staff.name.includes(query) || staff.kana.includes(query)
                );
            }

            if (!window.checked) {
                filteredData = NotGraduationedData;
            }

            if (filteredData.length === 0) {
                staffList.style.display = 'none';
                noResult.style.display = 'block';
            } else {
                noResult.style.display = 'none';
                staffList.style.display = 'block';
                staffList.scrollTop = 0;
                renderVirtualList(filteredData);
            }
        });

        searchInput.addEventListener('focus', () => {
            if (!window.checked) {
                filteredData = NotGraduationedData;
            }
            staffList.style.display = 'block';
            renderVirtualList(filteredData);
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (searchInput.value.trim() === "" && staffDetail.style.display === 'none') {
                    staffList.style.display = 'none';
                    noResult.style.display = 'none';
                }
            }, 200);
        });
    }

    if (closeDetail && staffDetail && searchInput && staffList) {
        closeDetail.addEventListener('click', () => {
            staffDetail.style.display = 'none';
            if (searchInput.value.trim() !== "") {
                staffList.style.display = 'block';
            }
        });
    }

    updateStaffCounter(allStaffDataCounter, false);
});

// Botではない場合、隠しリストを削除する
setInterval(() => {
    const checkbox = document.getElementById("is_graduationed_view");
    const allStaffDataCounter = document.getElementById('allStaffDataCounter');
    let checked = false;
    if (checkbox) {
        checked = checkbox.checked;
        window.checked = checked;
    }
    const hiddenList = document.getElementById("staffList-hidden");
    if (!isBot && hiddenList) {
        hiddenList.remove();
    }
    if (allStaffDataCounter) {
        updateStaffCounter(allStaffDataCounter, checked);
    }
}, 50);