/**
 * 붕어짱 인터랙티브 SPA 네비게이션 제어 스크립트
 */

// 화면 히스토리 관리를 위한 스택 구조
let screenHistory = [];

/**
 * 특정 화면 ID를 기반으로 화면을 전환하는 함수
 * @param {string} screenId - 활성화할 대상 요소 ID (예: 'scr-detail')
 */
function navigateTo(screenId) {
    // 1. 모든 스크린 요소를 숨김 처리
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // 2. 대상 스크린 활성화
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        // 상단 스크롤 초기화
        targetScreen.scrollTop = 0;
        
        // 내비게이션 히스토리 누적
        if (screenHistory[screenHistory.length - 1] !== screenId) {
            screenHistory.push(screenId);
        }

        // 장바구니 화면 진입 시 실시간 렌더링 호출
        if (screenId === 'scr-cart') {
            renderCart();
        }

        // 빵 종류 선택 화면 진입 시 이전 선택 상태 초기화 (디폴트 없앰)
        if (screenId === 'scr-dough') {
            selectedDoughType = null;
            selectedIngredientType = null;

            // UI상의 selected 클래스 모두 제거
            document.querySelectorAll('#scr-dough .menu-card').forEach(card => card.classList.remove('selected'));
            document.querySelectorAll('#scr-ingredients .menu-card').forEach(card => card.classList.remove('selected'));

            // 버튼 텍스트 원상 복구
            const btnIngredients = document.getElementById('btn-next-ingredients');
            if (btnIngredients) btnIngredients.textContent = '속재료 선택하기';

            const btnBeverages = document.getElementById('btn-next-beverages');
            if (btnBeverages) btnBeverages.textContent = '음료 선택하기';
        }
    }

    // 3. 하단 네비게이션 동기화 처리
    updateBottomNavSelection(screenId);
}

/**
 * 하단 내비게이션 바가 포함된 화면에서 현재 활성화된 메뉴 탭의 하이라이트 상태를 동기화
 */
function updateBottomNavSelection(screenId) {
    // 하단 바가 있는 모든 스크린에 대해 매핑 처리
    const navBars = document.querySelectorAll('.nav-bar-bottom');
    
    navBars.forEach(navBar => {
        const items = navBar.querySelectorAll('.nav-item');
        items.forEach(item => item.classList.remove('active'));

        // 홈 그룹 화면 연동
        if (['scr-dough', 'scr-detail', 'scr-ingredients', 'scr-beverages'].includes(screenId)) {
            if (items[0]) items[0].classList.add('active');
        } 
        // 리뷰 화면 연동
        else if (screenId === 'scr-reviews') {
            if (items[1]) items[1].classList.add('active');
        }
        // 알림 / QR 스캔 화면 연동
        else if (screenId === 'scr-qrcode') {
            if (items[2]) items[2].classList.add('active');
        }
        // 마이페이지 / 장바구니 화면 연동
        else if (screenId === 'scr-cart') {
            if (items[3]) items[3].classList.add('active');
        }
    });
}

// 브라우저 백버튼 이벤트 가로채기 대응 및 모바일 제스처 수용 목적의 뒤로가기 로직 정의
window.addEventListener('popstate', function() {
    if (screenHistory.length > 1) {
        screenHistory.pop(); // 현재 화면 제외
        const prevScreen = screenHistory.pop();
        navigateTo(prevScreen);
    }
});

// 초기 구동 시 인트로 화면 인덱싱 등록 및 URL 파라미터 감지 처리
document.addEventListener('DOMContentLoaded', () => {
    // 기본적으로 인트로 화면을 히스토리의 시작점에 기록
    screenHistory.push('scr-intro');
    
    // 네이버 로그인 콜백 확인
    checkNaverLoginCallback();
    
    // 카카오 로그인 SDK 초기화
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            Kakao.init('23e243ab8d838a096da972987027a26f');
        }
    }
    
    // UI 정보 동기화
    updateSettingsUI();

    // 꼬마 붕어 헤엄치기 애니메이션 가동
    initSwimmingBungeos();
    
    // URL에서 screen 파라미터가 있는지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const targetScreen = urlParams.get('screen');
    
    if (targetScreen && targetScreen !== 'scr-intro') {
        // 지정된 화면이 있으면 해당 화면으로 바로 이동
        navigateTo(targetScreen);
    }
});

/**
 * 인트로 화면의 꼬마 붕어들이 백그라운드에서 헤엄쳐 다니도록 제어하는 마이크로 인터랙션
 */
function initSwimmingBungeos() {
    const container = document.querySelector('.intro-graphic');
    if (!container) return;

    // 주기적으로 꼬마 붕어 생성
    setInterval(() => {
        // 인트로 화면이 활성화 상태일 때만 생성하여 백그라운드 리소스 소모 원천 차단
        const introScreen = document.getElementById('scr-intro');
        if (!introScreen || !introScreen.classList.contains('active')) return;

        // 동시 헤엄 수량 조절 (동시 최대 4마리까지 대기)
        if (container.querySelectorAll('.swimming-baby-bungeo').length >= 4) return;

        const baby = document.createElement('img');
        baby.className = 'swimming-baby-bungeo';
        baby.src = 'top_fish.png';
        
        // 자연스러운 아쿠아리움 연출을 위한 랜덤 속성 부여
        const size = Math.floor(Math.random() * 12) + 20; // 20px ~ 32px
        const topPos = Math.floor(Math.random() * 65) + 15; // 15% ~ 80%
        const duration = Math.random() * 3 + 4.5; // 4.5s ~ 7.5s (부드럽고 적당한 스피드)
        const direction = Math.random() > 0.5 ? 'ltr' : 'rtl'; // ltr: Left to Right, rtl: Right to Left
        
        baby.style.position = 'absolute';
        baby.style.width = `${size}px`;
        baby.style.height = 'auto';
        baby.style.top = `${topPos}%`;
        baby.style.zIndex = '2';
        baby.style.pointerEvents = 'none';
        baby.style.opacity = '0';
        baby.style.transition = 'opacity 0.6s';
        
        if (direction === 'ltr') {
            // 왼쪽에서 오른쪽으로 헤엄 (원래 왼쪽을 보고 있는 붕어 이미지를 가로 반전하여 머리가 헤엄 방향을 향하도록 설정)
            baby.style.transform = 'scaleX(-1)';
            baby.style.animation = `swim-left-to-right ${duration}s linear forwards`;
        } else {
            // 오른쪽에서 왼쪽으로 헤엄 (원래 왼쪽 방향 유지)
            baby.style.transform = 'scaleX(1)';
            baby.style.animation = `swim-right-to-left ${duration}s linear forwards`;
        }
        
        container.appendChild(baby);
        
        // 마운트 후 부드러운 투명도 등장 페이드 인 처리
        setTimeout(() => {
            baby.style.opacity = '0.55';
        }, 50);
        
        // 애니메이션 끝나면 소멸
        setTimeout(() => {
            baby.remove();
        }, duration * 1000);

    }, 2500); // 2.5초 간격으로 새로운 붕어 자연스럽게 스폰
}


// 도우(빵) 선택 상태 관리 변수 (기본값: null)
let selectedDoughType = null;

// 실시간 장바구니 리스트 상태 관리 변수
let cart = [];

// 빵 및 속재료 데이터 한글 이름 및 이미지 매핑
const DOUGH_MAP = {
    'plain': { name: '플레인', img: 'plain_dough.png' },
    'choco': { name: '초콜릿', img: 'choco_dough.png' },
    'matcha': { name: '말차', img: 'matcha_dough.png' },
    'egg': { name: '에그', img: 'egg_dough.png' }
};

const INGREDIENT_MAP = {
    'custard': { name: '슈크림', img: 'custard_ingredient.png' },
    'choco': { name: '초콜릿', img: 'choco_ingredient.png' },
    'redbean': { name: '단팥', img: 'redbean_ingredient.png' },
    'honey': { name: '꿀과 견과', img: 'honey_ingredient.png' }
};

/**
 * 빵 종류(도우)를 선택하는 함수
 * @param {HTMLElement} element - 클릭된 카드 요소
 * @param {string} doughType - 도우 타입 식별자 ('plain', 'choco', 'matcha', 'egg')
 */
function selectDough(element, doughType) {
    // 기존에 선택된 카드 해제
    const cards = document.querySelectorAll('#scr-dough .menu-card');
    cards.forEach(card => card.classList.remove('selected'));
    
    // 클릭된 카드 활성화
    element.classList.add('selected');
    selectedDoughType = doughType;
    
    // 미세한 햅틱 느낌의 스케일 효과 애니메이션 적용
    element.style.transform = 'scale(0.96)';
    setTimeout(() => {
        element.style.transform = '';
    }, 100);
    
    // 선택한 도우 종류에 맞춰 다음 단계 버튼의 텍스트 동적 갱신 (더 프리미엄한 사용자 경험 제공)
    const btn = document.getElementById('btn-next-ingredients');
    if (btn) {
        let name = '플레인';
        if (doughType === 'choco') name = '초콜릿';
        if (doughType === 'matcha') name = '말차';
        if (doughType === 'egg') name = '계란';
        btn.textContent = `${name} 도우 선택 완료`;
        
        // 1.2초 뒤 원래 텍스트로 자연스럽게 복구하여 일관성 유지
        setTimeout(() => {
            if (selectedDoughType === doughType) {
                btn.textContent = '속재료 선택하기';
            }
        }, 1200);
    }
}

/**
 * 선택된 도우 정보를 간직한 채 다음 화면(속재료 선택)으로 이동 (도우 선택 필수 검증)
 */
function goToIngredients() {
    if (!selectedDoughType) {
        showCustomToast('먼저 붕어빵 도우(빵 종류)를 선택해 주세요!', 'info');
        return;
    }
    navigateTo('scr-ingredients');
}

// 속재료 선택 상태 관리 변수 (기본값: null)
let selectedIngredientType = null;

/**
 * 속재료를 선택하는 함수
 * @param {HTMLElement} element - 클릭된 카드 요소
 * @param {string} ingredientType - 속재료 타입 식별자 ('choco', 'custard', 'redbean', 'honey')
 */
function selectIngredient(element, ingredientType) {
    // 기존에 선택된 카드 해제
    const cards = document.querySelectorAll('#scr-ingredients .menu-card');
    cards.forEach(card => card.classList.remove('selected'));
    
    // 클릭된 카드 활성화
    element.classList.add('selected');
    selectedIngredientType = ingredientType;
    
    // 미세한 햅틱 느낌의 스케일 효과 애니메이션 적용
    element.style.transform = 'scale(0.96)';
    setTimeout(() => {
        element.style.transform = '';
    }, 100);
    
    // 선택한 속재료 종류에 맞춰 다음 단계 버튼의 텍스트 동적 갱신 (더 프리미엄한 사용자 경험 제공)
    const btn = document.getElementById('btn-next-beverages');
    if (btn) {
        let name = '슈크림';
        if (ingredientType === 'choco') name = '초콜릿';
        if (ingredientType === 'redbean') name = '단팥';
        if (ingredientType === 'honey') name = '꿀과 견과';
        btn.textContent = `${name} 선택 완료`;
        
        // 1.2초 뒤 원래 텍스트로 자연스럽게 복구하여 일관성 유지
        setTimeout(() => {
            if (selectedIngredientType === ingredientType) {
                btn.textContent = '음료 선택하기';
            }
        }, 1200);
    }
}

/**
 * 현재 선택된 도우와 속재료 조합을 장바구니에 자동으로 저장 (중복 시 수량 증가)
 */
function saveCurrentBungeoToCart() {
    const doughKey = selectedDoughType || 'plain';
    const ingredientKey = selectedIngredientType || 'custard';

    const doughInfo = DOUGH_MAP[doughKey] || { name: doughKey, img: 'plain_dough.png' };
    const ingredientInfo = INGREDIENT_MAP[ingredientKey] || { name: ingredientKey, img: 'custard_ingredient.png' };

    // 중복 추가 방지: 이미 장바구니에 동일한 도우+속재료 조합이 있다면 수량만 증가시킴
    const existing = cart.find(item => 
        item.type === 'bungeo' && 
        item.dough === doughKey && 
        item.ingredient === ingredientKey
    );

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: 'bungeo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            type: 'bungeo',
            dough: doughKey,
            doughName: doughInfo.name,
            ingredient: ingredientKey,
            ingredientName: ingredientInfo.name,
            price: 2500,
            qty: 1,
            image: doughInfo.img
        });
    }
}

/**
 * 선택된 속재료 정보를 간직한 채 다음 화면(음료 선택)으로 이동하면서 붕어빵을 장바구니에 자동 저장 (속재료 검증 추가)
 */
function goToBeverages() {
    if (!selectedIngredientType) {
        showCustomToast('먼저 붕어빵 속재료를 선택해 주세요!', 'info');
        return;
    }
    saveCurrentBungeoToCart();
    navigateTo('scr-beverages');
}

/**
 * 선택된 도우와 속재료를 장바구니에 저장하고 즉시 장바구니 화면으로 바로 이동 (속재료 검증 추가)
 */
function addToCartAndNavigate() {
    if (!selectedIngredientType) {
        showCustomToast('먼저 붕어빵 속재료를 선택해 주세요!', 'info');
        return;
    }
    saveCurrentBungeoToCart();
    navigateTo('scr-cart');
}

/**
 * 장바구니에 음료 품목을 추가하고 장바구니 화면으로 이동
 */
function addDrinkToCartAndNavigate(name, price, img) {
    const existing = cart.find(item => 
        item.type === 'drink' && 
        item.name === name
    );

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: 'drink_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            type: 'drink',
            name: name,
            price: price,
            qty: 1,
            image: img || 'iced_coffee.png'
        });
    }

    navigateTo('scr-cart');
}

/**
 * 장바구니 리스트를 동적으로 HTML 렌더링
 */
function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #8D6E63; font-weight: 700; font-size: 15px;">
                <span class="material-icons-round" style="font-size: 48px; color: #D3C3BE; margin-bottom: 12px; display: block;">shopping_cart</span>
                장바구니가 비어 있습니다.
            </div>
        `;
        updateCartTotals();
        return;
    }

    container.innerHTML = '';
    cart.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.setAttribute('data-id', item.id);
        itemEl.setAttribute('data-price', item.price);
        itemEl.style.cssText = `
            background-color: #FFF; 
            border: 1px solid rgba(62,39,35,0.06); 
            border-radius: 24px; 
            padding: 12px 10px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            box-shadow: 0 4px 16px rgba(62,39,35,0.03); 
            transition: transform 0.2s, opacity 0.2s;
        `;

        let img = item.image;
        let title = '';
        let subtitle = '';
        let graphicHtml = '';

        if (item.type === 'bungeo') {
            title = item.doughName;
            subtitle = item.ingredientName;
            
            const ingredientInfo = INGREDIENT_MAP[item.ingredient] || { img: 'custard_ingredient.png' };
            graphicHtml = `
                <div class="cart-item-graphic" style="position: relative; width: 56px; height: 56px; flex-shrink: 0; background-color: #FFFDF5; border-radius: 16px; border: 1.5px solid rgba(211,142,50,0.15); box-shadow: 0 4px 12px rgba(62,39,35,0.04); display: flex; align-items: center; justify-content: center; overflow: visible;">
                    <!-- 메인 도우 (빵종류) 이미지 -->
                    <img class="cart-item-dough-img" src="${img}" alt="${title}"
                        style="width: 100%; height: 100%; border-radius: 16px; object-fit: contain; padding: 4px;">
                    <!-- 서브 속재료 이미지 배지 (16가지 조합을 완벽히 표상하는 듀얼 배지 시스템) -->
                    <div class="cart-item-ingredient-badge" 
                        style="position: absolute; bottom: -4px; right: -4px; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #FFF; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; background-color: #FFF; z-index: 3; display: flex; align-items: center; justify-content: center;">
                        <img src="${ingredientInfo.img}" alt="${subtitle}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </div>
            `;
        } else {
            title = item.name;
            if (title.includes('커피')) {
                subtitle = '';
                if (title.includes('아이스')) {
                    img = 'iced_coffee_1.png';
                } else if (title.includes('뜨거운') || title.includes('따뜻한')) {
                    img = 'hot_coffee_1.png';
                }
            } else {
                subtitle = '음료 페어링';
            }
            graphicHtml = `
                <img class="cart-item-img" src="${img}" alt="${title}"
                    style="width: 56px; height: 56px; border-radius: 16px; object-fit: cover; border: 1.5px solid rgba(211,142,50,0.1); box-shadow: 0 4px 12px rgba(62,39,35,0.04); flex-shrink: 0;">
            `;
        }

        const subtotal = item.price * item.qty;
        const subtitleHtml = subtitle ? `<p style="font-size: 13px; font-weight: 800; color: #8D6E63; margin: 0 0 2px 0; line-height: 1.2; white-space: nowrap;">${subtitle}</p>` : '';

        itemEl.innerHTML = `
            ${graphicHtml}
            <div class="item-details" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
                <h4 style="font-size: 15px; font-weight: 800; color: #000; margin: 0 0 2px 0; line-height: 1.2; white-space: nowrap;">${title}</h4>
                ${subtitleHtml}
                <p class="item-price" style="font-size: 15px; font-weight: 800; color: #D38E32; margin: 0; line-height: 1.2;">₩${subtotal.toLocaleString()}</p>
            </div>
            <div class="quantity-controller"
                style="display: flex; align-items: center; gap: 8px; background-color: #FFFDF5; border: 1px solid rgba(211,142,50,0.2); border-radius: 16px; padding: 3px 6px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(62,39,35,0.03);">
                <div class="qty-btn btn-minus" onclick="changeQtyById('${item.id}', -1)"
                    style="background-color: #FFF; color: #D38E32; border: 1px solid rgba(211,142,50,0.2); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; user-select: none;">
                    -</div>
                <span class="qty-num" style="font-size: 14px; font-weight: 800; color: #000; min-width: 20px; text-align: center;">${item.qty}</span>
                <div class="qty-btn btn-plus" onclick="changeQtyById('${item.id}', 1)"
                    style="background-color: #D38E32; color: #FFF; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(211,142,50,0.15); transition: all 0.2s; user-select: none;">
                    +</div>
            </div>
        `;
        container.appendChild(itemEl);
    });

    updateCartTotals();
}

/**
 * 장바구니 고유 ID 기반으로 수량을 조정하거나 삭제 처리
 */
function changeQtyById(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    let newQty = item.qty + delta;
    if (newQty < 1) {
        if (confirm('장바구니에서 이 상품을 삭제하시겠습니까?')) {
            const itemEl = document.querySelector(`.cart-item[data-id="${id}"]`);
            if (itemEl) {
                itemEl.style.opacity = '0';
                itemEl.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    cart = cart.filter(i => i.id !== id);
                    renderCart();
                }, 300);
            }
        }
        return;
    }

    item.qty = newQty;
    
    // 수량 변경 시 미세 스케일 햅틱 느낌 팝 애니메이션 추가 부여
    const qtySpan = document.querySelector(`.cart-item[data-id="${id}"] .qty-num`);
    if (qtySpan) {
        qtySpan.style.display = 'inline-block';
        qtySpan.style.transform = 'scale(1.2)';
        qtySpan.style.color = 'var(--app-main-amber)';
        qtySpan.style.transition = 'transform 0.15s, color 0.15s';
        setTimeout(() => {
            qtySpan.style.transform = '';
            qtySpan.style.color = '';
        }, 150);
    }

    renderCart();
}

/**
 * 장바구니 전체 품목 수량과 총 결제액 갱신 및 뱃지 동기화
 */
function updateCartTotals() {
    let totalOrder = 0;
    let totalQty = 0;

    cart.forEach(item => {
        totalOrder += item.price * item.qty;
        totalQty += item.qty;
    });

    // 최종 총 결제금액 갱신
    const finalPaySpan = document.getElementById('cart-final-pay');
    if (finalPaySpan) {
        finalPaySpan.textContent = `₩${totalOrder.toLocaleString()}`;
    }

    // 메인 헤더의 장바구니 아이콘 배지 실시간 동기화
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalQty;
        if (totalQty === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    });
}

/**
 * scr-detail 화면의 메인 붕어빵 이미지 슬라이더 제어 함수
 * @param {number} index - 보여줄 대상 이미지 인덱스 (0, 1, 2)
 */
function slideHero(index) {
    const track = document.querySelector('.detail-slider-track');
    if (track) {
        track.style.transform = `translateX(-${index * 210}px)`;
    }
    const dots = document.querySelectorAll('.indicator-dots .dot');
    dots.forEach((dot, idx) => {
        if (idx === index) {
            dot.classList.add('active');
            dot.style.backgroundColor = '#D38E32';
            dot.style.opacity = '1';
        } else {
            dot.classList.remove('active');
            dot.style.backgroundColor = '#D3E0E2';
            dot.style.opacity = '0.8';
        }
    });
}

/**
 * 토스페이먼츠 V2 표준 결제창 호출 함수
 */
async function requestTossPayment() {
    const items = document.querySelectorAll('#scr-cart .cart-item');
    if (items.length === 0) {
        alert('장바구니가 비어 있습니다.');
        return;
    }
    
    // 주문명 구성 (예: 에그 슈크림 외 2건)
    let firstItemName = "";
    const h4 = items[0].querySelector('h4');
    const p = items[0].querySelector('p');
    if (h4) firstItemName += h4.textContent.trim();
    if (p && !p.classList.contains('item-price')) firstItemName += " " + p.textContent.trim();
    
    let orderName = firstItemName.trim();
    if (items.length > 1) {
        orderName += ` 외 ${items.length - 1}건`;
    }
    
    // 성공/실패 화면에서 상품명을 동적으로 읽을 수 있도록 세션 스토리지에 보관
    sessionStorage.setItem('lastOrderName', orderName);
    
    // 총 결제 금액 계산
    let totalAmount = 0;
    items.forEach(item => {
        const price = parseInt(item.getAttribute('data-price'), 10);
        const qty = parseInt(item.querySelector('.qty-num').textContent, 10);
        totalAmount += price * qty;
    });
    
    if (totalAmount <= 0) {
        alert('결제 금액이 0원입니다.');
        return;
    }
    
    // 무작위 주문번호 생성 (6자 이상 64자 이하)
    const orderId = 'order_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    
    // 토스페이먼츠 객체 초기화 (V2 표준)
    const clientKey = 'test_ck_vZnjEJeQVxPeEkJ25KyDVPmOoBN0';
    
    const tosspayments = TossPayments(clientKey);
    
    // 결제창 결제 인스턴스 생성
    const payment = tosspayments.payment({
        customerKey: 'customer_bungeoppang_user_123'
    });
    
    // 현재 실행중인 디렉토리의 success.html, fail.html 상대 경로 계산
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    // success/fail URL 구성
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    let successUrl, failUrl;
    if (protocol === 'file:') {
        // 로컬 파일 실행 시 호환성 확보용 경로
        successUrl = `${protocol}//${currentPath.replace('index.html', 'success.html')}`;
        failUrl = `${protocol}//${currentPath.replace('index.html', 'fail.html')}`;
    } else {
        successUrl = `${protocol}//${host}${basePath}/success.html`;
        failUrl = `${protocol}//${host}${basePath}/fail.html`;
    }
    
    // 토스페이먼츠 iframe 감시자 가동: SDK가 생성한 iframe을 .phone-container 내부로 실시간 가로채 이동시킴
    initTossIframeObserver();
    
    try {
        await payment.requestPayment({
            method: 'CARD', // 카드로 고정
            amount: {
                currency: 'KRW',
                value: totalAmount
            },
            orderId: orderId,
            orderName: orderName,
            successUrl: successUrl,
            failUrl: failUrl,
            windowTarget: 'iframe', // 아이프레임 모드로 결제창 호출
            card: {
                useEscrow: false,
                useCardPoint: false,
                useAppCardOnly: false
            }
        });
    } catch (error) {
        console.error('결제 요청 중 오류가 발생했습니다:', error);
        alert('결제 창을 여는 도중 오류가 발생했습니다: ' + error.message);
    }
}

/**
 * 토스페이먼츠 SDK가 생성하는 결제창 iframe 및 컨테이너를 실시간으로 감지하여 .phone-container 내부로 강제 이동 및 스타일 조정
 */
function initTossIframeObserver() {
    const phoneContainer = document.querySelector('.phone-container');
    if (!phoneContainer) return;

    // 1. 강제 가로채기 및 위치 교정 함수 정의
    const interceptAndFix = (node) => {
        // 이미 phoneContainer 내부의 자식이면 무시
        if (phoneContainer.contains(node)) return;

        // 토스페이먼츠 관련 엘리먼트인지 엄격 검증
        let isTossElement = false;

        // A. 노드 자체가 iframe이거나 내부에 iframe을 가지고 있는 경우
        const iframe = node.tagName === 'IFRAME' ? node : (node.querySelector ? node.querySelector('iframe') : null);
        if (iframe) {
            const src = iframe.src || '';
            if (src.includes('tosspayments') || src.includes('toss') || iframe.id.includes('toss') || iframe.name.includes('toss')) {
                isTossElement = true;
            }
        }

        // B. 노드의 ID나 클래스명, 또는 고유 스타일 속성으로 검증 (토스 결제창의 고유 특징인 초고값 z-index와 fixed 포지션)
        const id = node.id || '';
        const className = typeof node.className === 'string' ? node.className : '';
        const styleAttr = node.getAttribute('style') || '';
        if (
            id.includes('toss') || 
            className.includes('toss') || 
            (styleAttr.includes('z-index') && (styleAttr.includes('2147483647') || styleAttr.includes('9999')))
        ) {
            isTossElement = true;
        }

        if (isTossElement) {
            console.log('토스페이먼츠 엘리먼트 감지 및 폰 목업 내부로 가로채기 이동 실행:', node);
            
            // 폰 컨테이너 내부로 이동
            phoneContainer.appendChild(node);

            // 포지션을 absolute로 강제 고정하여 폰 프레임 밖으로 나가지 않도록 완전 교정
            node.style.setProperty('position', 'absolute', 'important');
            node.style.setProperty('top', '0', 'important');
            node.style.setProperty('left', '0', 'important');
            node.style.setProperty('width', '100%', 'important');
            node.style.setProperty('height', '100%', 'important');
            node.style.setProperty('z-index', '2000', 'important');
            node.style.setProperty('border-radius', '36px', 'important');
            node.style.setProperty('overflow', 'hidden', 'important');
            node.style.setProperty('transform', 'none', 'important');
            node.style.setProperty('max-width', '100%', 'important');
            node.style.setProperty('max-height', '100%', 'important');

            if (iframe && iframe !== node) {
                iframe.style.setProperty('position', 'absolute', 'important');
                iframe.style.setProperty('top', '0', 'important');
                iframe.style.setProperty('left', '0', 'important');
                iframe.style.setProperty('width', '100%', 'important');
                iframe.style.setProperty('height', '100%', 'important');
                iframe.style.setProperty('border-radius', '36px', 'important');
            }
        }
    };

    // 2. MutationObserver 설정 (신속 감지용)
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const callback = function(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        interceptAndFix(node);
                        // 자식 노드들도 탐색
                        node.querySelectorAll && node.querySelectorAll('*').forEach(child => interceptAndFix(child));
                    }
                });
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // 3. 주기적 폴링 스캐너 가동 (CORS 및 비동기 지연 마운트 대비용 100% 안전장치)
    const scanInterval = setInterval(() => {
        // body 직속 자식 중 z-index가 매우 높은 div 또는 toss iframe 탐색
        document.body.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                interceptAndFix(node);
            }
        });
    }, 100);

    // 30초 후 모든 감시 리소스 자동 반환 (결제창 구동 완료 시점 대비)
    setTimeout(() => {
        observer.disconnect();
        clearInterval(scanInterval);
    }, 30000);
}

/**
 * 붕어 리뷰 작성하기 클릭 시 커스텀 프리미엄 알림 토스트 표시
 */
function showReviewToast() {
    // 기존에 활성화된 토스트가 있다면 제거
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `
        <span class="material-icons-round" style="color: #FFB300; font-size: 20px;">info</span>
        <span>리뷰는 실제 주문 완료 후에 작성하실 수 있습니다!</span>
    `;
    
    // 스타일 지정
    toast.style.position = 'absolute';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.backgroundColor = 'rgba(74, 43, 32, 0.95)';
    toast.style.color = '#FFF';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '24px';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = '700';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    toast.style.whiteSpace = 'nowrap';

    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
        phoneContainer.appendChild(toast);
        
        // 애니메이션 작동
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 50);

        // 3초 후 페이드 아웃 소멸
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

/**
 * 프리미엄 디자인 커스텀 토스트 알림 표시 함수
 */
function showCustomToast(message, iconName = 'info') {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `
        <span class="material-icons-round" style="color: #FFB300; font-size: 20px;">${iconName}</span>
        <span style="font-size: 13.5px; font-weight: 700;">${message}</span>
    `;
    
    // 스타일 지정
    toast.style.position = 'absolute';
    toast.style.bottom = '95px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.backgroundColor = 'rgba(74, 43, 32, 0.98)';
    toast.style.color = '#FFF';
    toast.style.padding = '14px 22px';
    toast.style.borderRadius = '24px';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.zIndex = '2500';
    toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
    toast.style.opacity = '0';
    toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
    toast.style.pointerEvents = 'none';
    toast.style.whiteSpace = 'nowrap';
    
    // .phone-container가 있을 경우 내부에 부착, 없을 경우 body에 부착
    const phoneContainer = document.querySelector('.phone-container') || document.body;
    phoneContainer.appendChild(toast);
    
    // 레이아웃 트리거 후 강제 리플로우
    void toast.offsetHeight;
    
    // 활성화 상태 전환
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
    
    // 2.5초 후 자동으로 서서히 사라지도록 처리
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 2500);
}


/**
 * 리뷰 작성 화면에서 별점을 조작하는 함수
 */
let currentWriteRating = 5;

function setRating(score) {
    currentWriteRating = score;
    const stars = document.querySelectorAll('#rating-stars-write .star-btn');
    stars.forEach((star, idx) => {
        if (idx < score) {
            star.style.color = '#FFB300';
            star.textContent = 'star';
        } else {
            star.style.color = '#DDD';
            star.textContent = 'star_border';
        }
    });
}

// 실시간 인앱 카메라 스트림 추적 변수
let cameraStream = null;

/**
 * 리뷰 작성 포토 업로드 트리거 - 카메라/앨범 바텀시트 열기
 */
function triggerPhotoUpload() {
    const sheet = document.getElementById('photo-choice-bottom-sheet');
    if (sheet) {
        sheet.style.display = 'flex';
        void sheet.offsetHeight; // 강제 리플로우
        sheet.classList.add('active');
    }
}

/**
 * 포토 선택 바텀시트 닫기
 */
function closePhotoChoice() {
    const sheet = document.getElementById('photo-choice-bottom-sheet');
    if (sheet) {
        sheet.classList.remove('active');
        setTimeout(() => {
            if (!sheet.classList.contains('active')) {
                sheet.style.display = 'none';
            }
        }, 300);
    }
}

/**
 * 카메라 또는 앨범 선택 실행
 */
function selectPhotoFrom(source) {
    closePhotoChoice();
    if (source === 'camera') {
        // 인앱 실시간 카메라 가동 시도
        startInAppCamera();
    } else if (source === 'album') {
        const albInput = document.getElementById('review-photo-file-album');
        if (albInput) albInput.click();
    }
}

/**
 * 실시간 인앱 카메라 시작 함수 (WebRTC getUserMedia 연동)
 */
async function startInAppCamera() {
    const container = document.getElementById('in-app-camera-container');
    const video = document.getElementById('camera-video');
    
    if (!container || !video) {
        fallbackToCameraInput();
        return;
    }

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("getUserMedia API not supported");
        }

        const constraints = {
            video: {
                facingMode: 'environment', // 후면 카메라 우선
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStream;
        
        container.style.display = 'flex';
    } catch (error) {
        console.warn("실시간 인앱 카메라 연결 실패, 표준 파일 인풋으로 우회합니다:", error);
        fallbackToCameraInput();
    }
}

/**
 * getUserMedia가 지원되지 않거나 카메라 실패 시 표준 디바이스 카메라 앱 호출 폴백
 */
function fallbackToCameraInput() {
    showCustomToast('표준 카메라 인풋을 활성화합니다.', 'photo_camera');
    const camInput = document.getElementById('review-photo-file-camera');
    if (camInput) camInput.click();
}

/**
 * 실시간 인앱 카메라 중지 및 스트림 해제
 */
function stopInAppCamera() {
    const container = document.getElementById('in-app-camera-container');
    const video = document.getElementById('camera-video');
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    if (video) {
        video.srcObject = null;
    }
    
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * 실시간 비디오 프레임을 캔버스로 따서 사진으로 등록 (셔터 플래시 효과 포함)
 */
function capturePhotoFromVideo() {
    const video = document.getElementById('camera-video');
    const container = document.getElementById('in-app-camera-container');
    const flash = document.getElementById('camera-flash');
    
    if (!video || !container) return;
    
    // 셔터 플래시 애니메이션 실행
    if (flash) {
        flash.classList.remove('flash-active');
        void flash.offsetWidth; // 강제 리플로우
        flash.classList.add('flash-active');
    }
    
    // 비디오 현재 시각의 스냅샷 캡처
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // 프리뷰 영역 표시 처리
        document.getElementById('photo-preview-img').src = dataUrl;
        document.getElementById('photo-preview-container').style.display = 'block';
        document.getElementById('photo-upload-trigger').style.display = 'none';
    }
    
    // 촬영음 또는 셔터 터치 피드백 후 0.25초 후 카메라 정리 및 닫기
    setTimeout(() => {
        stopInAppCamera();
        showCustomToast('사진 촬영 완료!', 'check_circle');
    }, 250);
}

/**
 * 리뷰 포토 미리보기 기능
 */
function previewReviewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photo-preview-img').src = e.target.result;
            document.getElementById('photo-preview-container').style.display = 'block';
            document.getElementById('photo-upload-trigger').style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * 등록하려던 포토 제거
 */
function removeReviewPhoto() {
    const albInput = document.getElementById('review-photo-file-album');
    const camInput = document.getElementById('review-photo-file-camera');
    if (albInput) albInput.value = '';
    if (camInput) camInput.value = '';
    document.getElementById('photo-preview-container').style.display = 'none';
    document.getElementById('photo-upload-trigger').style.display = 'flex';
}

/**
 * 리뷰 최종 등록 및 유효성 검사
 */
function submitReview() {
    const comment = document.getElementById('review-comment-input').value.trim();
    if (!comment) {
        alert('상세 리뷰를 입력해주세요!');
        return;
    }
    if (comment.length < 10) {
        alert('리뷰 내용은 최소 10자 이상 작성해주세요.');
        return;
    }
    
    alert('리뷰가 정상적으로 등록되었습니다!');
    
    // 입력 데이터 초기화
    document.getElementById('review-comment-input').value = '';
    setRating(5);
    removeReviewPhoto();
    
    // 리뷰 목록 화면으로 복귀
    navigateTo('scr-reviews');
}

/**
 * 패스워드 표시/숨김 토글 제어 기능
 */
function togglePassword(iconElement) {
    const input = iconElement.previousElementSibling;
    if (input && input.type === 'password') {
        input.type = 'text';
        iconElement.textContent = 'visibility';
    } else if (input) {
        input.type = 'password';
        iconElement.textContent = 'visibility_off';
    }
}

/**
 * 비밀번호 찾기 SMS 발송 시뮬레이션 함수
 */
function sendPasswordSMS() {
    const phoneInput = document.getElementById('find-password-phone').value.trim();
    if (!phoneInput) {
        alert('전화번호를 입력해주세요!');
        return;
    }
    
    // 전화번호 형식 유효성 체크
    const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
    const digitsOnlyRegex = /^\d{10,11}$/;
    
    if (!phoneRegex.test(phoneInput) && !digitsOnlyRegex.test(phoneInput)) {
        alert('올바른 전화번호 형식을 입력해주세요. (예: 010-XXXX-XXXX)');
        return;
    }

    // 전송 성공 알림 시뮬레이션
    alert(`[붕어짱] 비밀번호 발송 완료!\n\n입력하신 번호(${phoneInput})로 기존 6자리 비밀번호가 포함된 SMS 문자가 발송되었습니다.`);
    
    // 입력창 초기화
    document.getElementById('find-password-phone').value = '';
    
    // 로그인 페이지로 자동 이동
    navigateTo('scr-login');
}

/**
 * 맛있는 리뷰 클릭 시 붕어빵 이미지들이 춤추는 마이크로 인터랙션
 */
function danceFish() {
    const fishes = document.querySelectorAll('.detail-hero-img');
    fishes.forEach(fish => {
        // 기존 클래스를 먼저 제거
        fish.classList.remove('fish-dancing');
        // 강제 리플로우를 일으켜 애니메이션이 다시 트리거되도록 처리
        void fish.offsetWidth;
        // 춤추는 애니메이션 클래스 할당
        fish.classList.add('fish-dancing');
    });
}

/* ==========================================
 * [관리자 모드 & 설정 마이페이지 기능]
 * ========================================== */

// 사용자 세션 및 권한 변수
let currentUserRole = 'user'; // 기본 권한: 일반 회원 (admin 로그인시 'admin' 전환)
let currentUserName = '비회원 고객';
let currentUserPhone = '';

// 가입 회원 데이터베이스 모의 데이터
let mockUsers = [
    { id: 1, name: '김민수', phone: '010-1234-5678', role: 'user', blocked: false },
    { id: 2, name: '박지민', phone: '010-8765-4321', role: 'user', blocked: false },
    { id: 3, name: '최고관리자', phone: '010-0000-0000', role: 'admin', blocked: false }
];

// 상품 리뷰 데이터베이스 모의 데이터
let mockReviews = [
    { id: 1, author: '김철수', stars: 5, date: '2026.05.28', content: '갓 구워서 겉은 바삭하고 속은 부드러운 슈크림이 가득 차 있어서 정말 맛있었습니다! 아이들도 좋아해서 재구매 의사 100% 입니다.', category: '#겉바속촉', blinded: false },
    { id: 2, author: '이영희', stars: 4, date: '2026.05.27', content: '슈크림 붕어빵 맛집 인정입니다! 속재료가 꼬리까지 꽉 차 있어서 입안 가득 부드러움이 퍼지네요 ㅎㅎ 커피 조합 추천해요!', category: '#슈크림대박', blinded: false }
];

// 비밀번호 찾기 시 가입 여부 체크 및 인증번호 발송 시뮬레이션에서도 회원 데이터 동기화
function handleLogin() {
    const phoneInput = document.getElementById('login-phone-input').value.trim();
    const pwInput = document.getElementById('login-pw-input').value.trim();

    if (!phoneInput) {
        alert('전화번호를 입력해주세요!');
        return;
    }
    if (!pwInput || pwInput.length !== 6) {
        alert('비밀번호는 숫자 6자리로 입력해주세요!');
        return;
    }

    // 관리자 특수 로그인 처리 (010-0000-0000 또는 admin, 비밀번호 000000)
    if ((phoneInput === 'admin' || phoneInput === '010-0000-0000') && pwInput === '000000') {
        currentUserRole = 'admin';
        currentUserName = '붕어대장';
        currentUserPhone = '최고관리자';
        alert('🔑 관리자 권한으로 로그인하였습니다.\n설정(우측 상단 톱니바퀴) 메뉴에서 [관리자 콘솔]에 진입할 수 있습니다!');
        
        // UI 동기화
        updateSettingsUI();
        renderAdminUsers();
        renderAdminReviews();
        navigateTo('scr-dough');
    } else {
        // 일반 회원 모의 로그인
        currentUserRole = 'user';
        currentUserName = '붕어대장';
        currentUserPhone = phoneInput;
        alert(`🎉 ${currentUserName}님으로 성공적으로 로그인되었습니다!`);
        
        updateSettingsUI();
        navigateTo('scr-dough');
    }
}

// 네이버 로그인 실시간 연동 콜백 확인 함수
function checkNaverLoginCallback() {
    if (window.location.hash.includes('access_token') || window.location.hash.includes('naver')) {
        if (typeof naver !== 'undefined' && naver.LoginWithNaverId) {
            const naverLogin = new naver.LoginWithNaverId({
                clientId: "Qx0NpItojaQW_NVuOzHg",
                callbackUrl: window.location.origin + window.location.pathname,
                isPopup: false
            });
            naverLogin.init();
            
            naverLogin.getLoginStatus(function (status) {
                if (status) {
                    const userName = naverLogin.user.getName() || '네이버 회원';
                    const userEmail = naverLogin.user.getEmail() || '';
                    const userPhone = naverLogin.user.getMobile() || 'SNS_Naver';
                    
                    currentUserRole = 'user';
                    currentUserName = userName;
                    currentUserPhone = userPhone;
                    
                    alert(`🎉 네이버 계정 정보 연동 완료!\n"${currentUserName}"님으로 정상적으로 로그인되었습니다.`);
                    updateSettingsUI();
                    
                    // URL 주소창 해시 정리
                    history.replaceState(null, null, window.location.pathname);
                    navigateTo('scr-dough');
                }
            });
        }
    }
}

// SNS 계정 연동 간편 로그인 처리
function handleSnsLogin(provider) {
    if (provider === 'kakao') {
        const isWebServer = window.location.protocol.startsWith('http');
        if (isWebServer && typeof Kakao !== 'undefined') {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(255,253,245,0.96); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: opacity 0.3s; opacity: 0;
            `;
            loadingOverlay.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FEE500; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(254,229,0,0.4);">
                    <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: #191919;">
                        <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.56 1.71 4.8 4.28 6.005-.17.585-.62 2.12-.71 2.455-.1.35.12.35.25.26.11-.07 1.83-1.24 2.56-1.745.86.24 1.77.375 2.62.375 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
                    </svg>
                </div>
                <h3 style="font-size: 20px; font-weight: 800; color: #3E2723; margin: 0 0 8px 0; font-family: inherit;">카카오 로그인 연결 중</h3>
                <p style="font-size: 14px; font-weight: 700; color: #8D6E63; margin: 0 0 24px 0; font-family: inherit;">카카오 인증 창을 로딩하고 있습니다.</p>
                <div class="sns-spinner" style="width: 28px; height: 28px; border: 3px solid rgba(211,142,50,0.15); border-top: 3px solid #D38E32; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loadingOverlay);
            setTimeout(() => { loadingOverlay.style.opacity = '1'; }, 10);
            
            Kakao.Auth.login({
                success: function(authObj) {
                    Kakao.API.request({
                        url: '/v2/user/me',
                        success: function(res) {
                            loadingOverlay.style.opacity = '0';
                            setTimeout(() => { loadingOverlay.remove(); }, 300);
                            
                            const nickname = res.kakao_account.profile.nickname || '카카오 회원';
                            const mobile = res.kakao_account.phone_number || 'SNS_Kakao';
                            
                            currentUserRole = 'user';
                            currentUserName = nickname;
                            currentUserPhone = mobile;
                            
                            alert(`🎉 카카오 계정 정보 연동 완료!\n"${currentUserName}"님으로 정상적으로 로그인되었습니다.`);
                            updateSettingsUI();
                            navigateTo('scr-dough');
                        },
                        fail: function(error) {
                            loadingOverlay.remove();
                            alert("카카오 프로필 정보 획득에 실패했습니다.");
                            console.error(error);
                        }
                    });
                },
                fail: function(err) {
                    loadingOverlay.remove();
                    alert("카카오 로그인 인증이 취소되었거나 실패했습니다.");
                    console.error(err);
                }
            });
            return;
        }
    }

    if (provider === 'naver') {
        const isWebServer = window.location.protocol.startsWith('http');
        if (isWebServer) {
            const clientId = "Qx0NpItojaQW_NVuOzHg";
            const callbackUrl = window.location.origin + window.location.pathname;
            const state = Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem("naver_oauth_state", state);
            
            const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;
            
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(255,253,245,0.96); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: opacity 0.3s; opacity: 0;
            `;
            loadingOverlay.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #03C75A; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(3,199,90,0.4);">
                    <svg viewBox="0 0 24 24" style="width: 30px; height: 30px; fill: #FFFFFF;">
                        <path d="M16.2 3H21v18h-4.8l-8.4-12.3V21H3V3h4.8l8.4 12.3V3z"/>
                    </svg>
                </div>
                <h3 style="font-size: 20px; font-weight: 800; color: #3E2723; margin: 0 0 8px 0; font-family: inherit;">네이버 로그인 창으로 안전하게 이동 중</h3>
                <p style="font-size: 14px; font-weight: 700; color: #8D6E63; margin: 0 0 24px 0; font-family: inherit;">네이버 보안 로그인 페이지로 리다이렉트 중입니다.</p>
                <div class="sns-spinner" style="width: 28px; height: 28px; border: 3px solid rgba(211,142,50,0.15); border-top: 3px solid #D38E32; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loadingOverlay);
            setTimeout(() => { loadingOverlay.style.opacity = '1'; }, 10);
            
            setTimeout(() => {
                window.location.href = naverAuthUrl;
            }, 800);
            return;
        }
    }

    let providerName = '';
    let userName = '';
    let themeColor = '';
    
    if (provider === 'kakao') {
        providerName = '카카오';
        userName = '카카오 붕어짱';
        themeColor = '#FEE500';
    } else if (provider === 'naver') {
        providerName = '네이버';
        userName = '네이버 붕어짱';
        themeColor = '#03C75A';
    } else if (provider === 'google') {
        providerName = '구글';
        userName = '구글 붕어짱';
        themeColor = '#4285F4';
    }
    
    // 프리미엄 애니메이션용 로딩 오버레이 생성
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255,253,245,0.96);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s;
        opacity: 0;
    `;
    
    let logoSvg = '';
    if (provider === 'kakao') {
        logoSvg = `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FEE500; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(254,229,0,0.4);">
                <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: #191919;">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.56 1.71 4.8 4.28 6.005-.17.585-.62 2.12-.71 2.455-.1.35.12.35.25.26.11-.07 1.83-1.24 2.56-1.745.86.24 1.77.375 2.62.375 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
                </svg>
            </div>
        `;
    } else if (provider === 'naver') {
        logoSvg = `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #03C75A; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(3,199,90,0.4);">
                <svg viewBox="0 0 24 24" style="width: 30px; height: 30px; fill: #FFFFFF;">
                    <path d="M16.2 3H21v18h-4.8l-8.4-12.3V21H3V3h4.8l8.4 12.3V3z"/>
                </svg>
            </div>
        `;
    } else if (provider === 'google') {
        logoSvg = `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FFFFFF; border: 1.5px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px;">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
            </div>
        `;
    }
    
    loadingOverlay.innerHTML = `
        ${logoSvg}
        <h3 style="font-size: 20px; font-weight: 800; color: #3E2723; margin: 0 0 8px 0; font-family: inherit;">${providerName} 계정 연동 중</h3>
        <p style="font-size: 14px; font-weight: 700; color: #8D6E63; margin: 0 0 24px 0; font-family: inherit;">보안 채널을 통해 계정을 안전하게 조회하고 있습니다.</p>
        <div class="sns-spinner" style="width: 28px; height: 28px; border: 3px solid rgba(211,142,50,0.15); border-top: 3px solid #D38E32; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // 페이드인 실행
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);
    
    // 1.2초 후 로그인 성공 처리 시뮬레이션
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
            
            // 로그인 상태 글로벌 변수 설정
            currentUserRole = 'user';
            currentUserName = userName;
            currentUserPhone = `SNS_${providerName}`;
            
            alert(`🎉 ${userName}님으로 안전하게 간편 로그인되었습니다!`);
            updateSettingsUI();
            navigateTo('scr-dough');
        }, 300);
    }, 1200);
}

// SNS 계정 연동 간편가입 처리
function handleSnsRegister(provider) {
    if (provider === 'kakao') {
        const isWebServer = window.location.protocol.startsWith('http');
        if (isWebServer && typeof Kakao !== 'undefined') {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(255,253,245,0.96); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: opacity 0.3s; opacity: 0;
            `;
            loadingOverlay.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FEE500; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(254,229,0,0.4);">
                    <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: #191919;">
                        <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.56 1.71 4.8 4.28 6.005-.17.585-.62 2.12-.71 2.455-.1.35.12.35.25.26.11-.07 1.83-1.24 2.56-1.745.86.24 1.77.375 2.62.375 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
                    </svg>
                </div>
                <h3 style="font-size: 20px; font-weight: 800; color: #3E2723; margin: 0 0 8px 0; font-family: inherit;">카카오 회원가입 연동 중</h3>
                <p style="font-size: 14px; font-weight: 700; color: #8D6E63; margin: 0 0 24px 0; font-family: inherit;">간편가입을 위해 카카오 계정 연동을 준비하고 있습니다.</p>
                <div class="sns-spinner" style="width: 28px; height: 28px; border: 3px solid rgba(211,142,50,0.15); border-top: 3px solid #D38E32; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loadingOverlay);
            setTimeout(() => { loadingOverlay.style.opacity = '1'; }, 10);
            
            Kakao.Auth.login({
                success: function(authObj) {
                    Kakao.API.request({
                        url: '/v2/user/me',
                        success: function(res) {
                            loadingOverlay.style.opacity = '0';
                            setTimeout(() => { loadingOverlay.remove(); }, 300);
                            
                            const nickname = res.kakao_account.profile.nickname || '카카오 회원';
                            const mobile = res.kakao_account.phone_number || 'SNS_Kakao';
                            
                            currentUserRole = 'user';
                            currentUserName = nickname;
                            currentUserPhone = mobile;
                            
                            alert(`🎉 카카오 간편 회원가입 및 로그인 완료!\n"${currentUserName}"님, 환영합니다!`);
                            updateSettingsUI();
                            navigateTo('scr-dough');
                        },
                        fail: function(error) {
                            loadingOverlay.remove();
                            alert("카카오 프로필 정보 획득에 실패했습니다.");
                            console.error(error);
                        }
                    });
                },
                fail: function(err) {
                    loadingOverlay.remove();
                    alert("카카오 회원가입 인증이 취소되었거나 실패했습니다.");
                    console.error(err);
                }
            });
            return;
        }
    }

    if (provider === 'naver') {
        const isWebServer = window.location.protocol.startsWith('http');
        if (isWebServer) {
            const clientId = "Qx0NpItojaQW_NVuOzHg";
            const callbackUrl = window.location.origin + window.location.pathname;
            const state = Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem("naver_oauth_state", state);
            
            const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;
            
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(255,253,245,0.96); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: opacity 0.3s; opacity: 0;
            `;
            loadingOverlay.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #03C75A; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(3,199,90,0.4);">
                    <svg viewBox="0 0 24 24" style="width: 30px; height: 30px; fill: #FFFFFF;">
                        <path d="M16.2 3H21v18h-4.8l-8.4-12.3V21H3V3h4.8l8.4 12.3V3z"/>
                    </svg>
                </div>
                <h3 style="font-size: 20px; font-weight: 800; color: #3E2723; margin: 0 0 8px 0; font-family: inherit;">네이버 회원가입 연동 중</h3>
                <p style="font-size: 14px; font-weight: 700; color: #8D6E63; margin: 0 0 24px 0; font-family: inherit;">네이버 간편가입 페이지로 안전하게 이동 중입니다.</p>
                <div class="sns-spinner" style="width: 28px; height: 28px; border: 3px solid rgba(211,142,50,0.15); border-top: 3px solid #D38E32; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loadingOverlay);
            setTimeout(() => { loadingOverlay.style.opacity = '1'; }, 10);
            
            setTimeout(() => {
                window.location.href = naverAuthUrl;
            }, 800);
            return;
        }
    }

    let providerName = '';
    let userName = '';
    
    if (provider === 'kakao') {
        providerName = '카카오';
        userName = '카카오 붕어짱';
    } else if (provider === 'naver') {
        providerName = '네이버';
        userName = '네이버 붕어짱';
    } else if (provider === 'google') {
        providerName = '구글';
        userName = '구글 붕어짱';
    }
    
    // 프리미엄 애니메이션용 로딩 오버레이 생성
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255,253,245,0.96);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s;
        opacity: 0;
    `;
    
    let logoSvg = '';
    if (provider === 'kakao') {
        logoSvg = `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FEE500; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(254,229,0,0.4);">
                <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: #191919;">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.56 1.71 4.8 4.28 6.005-.17.585-.62 2.12-.71 2.455-.1.35.12.35.25.26.11-.07 1.83-1.24 2.56-1.745.86.24 1.77.375 2.62.375 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
                </svg>
            </div>
        `;
    } else if (provider === 'naver') {
        logoSvg = `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #03C75A; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(3,199,90,0.4);">
                <svg viewBox="0 0 24 24" style="width: 30px; height: 30px; fill: #FFFFFF;">
                    <path d="M16.2 3H21v18h-4.8l-8.4-12.3V21H3V3h4.8l8.4 12.3V3z"/>
                </svg>
            </div>
        `;
    } else if (provider === 'google') {
        logoSvg = `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FFFFFF; border: 1.5px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px;">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
            </div>
        `;
    }
    
    loadingOverlay.innerHTML = `
        ${logoSvg}
        <h3 style="font-size: 20px; font-weight: 800; color: #3E2723; margin: 0 0 8px 0; font-family: inherit;">${providerName} 계정 정보 연동 중</h3>
        <p style="font-size: 14px; font-weight: 700; color: #8D6E63; margin: 0 0 24px 0; font-family: inherit;">간편가입을 위해 필수 프로필 정보를 동기화하고 있습니다.</p>
        <div class="sns-spinner" style="width: 28px; height: 28px; border: 3px solid rgba(211,142,50,0.15); border-top: 3px solid #D38E32; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // 페이드인 실행
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);
    
    // 1.5초 후 가입 성공 및 자동 로그인 처리 시뮬레이션
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
            
            // 로그인 상태 글로벌 변수 설정
            currentUserRole = 'user';
            currentUserName = userName;
            currentUserPhone = `SNS_${providerName}`;
            
            alert(`🎉 ${userName}님, 축하합니다!\n${providerName} 간편 회원가입 및 로그인이 완료되었습니다.`);
            updateSettingsUI();
            navigateTo('scr-dough');
        }, 300);
    }, 1500);
}

// 회원가입 처리
function handleRegister() {
    const phoneInput = document.getElementById('register-phone-input').value.trim();
    const nameInput = document.getElementById('register-name-input').value.trim();
    const pwInput = document.getElementById('register-pw-input').value.trim();
    const pwConfirmInput = document.getElementById('register-pw-confirm-input').value.trim();

    if (!phoneInput || !nameInput || !pwInput || !pwConfirmInput) {
        alert('모든 가입 항목을 채워주세요!');
        return;
    }

    // 전화번호 형식 유효성 체크
    const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
    const digitsOnlyRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phoneInput) && !digitsOnlyRegex.test(phoneInput)) {
        alert('올바른 전화번호 형식을 입력해주세요. (예: 010-XXXX-XXXX)');
        return;
    }

    if (pwInput.length !== 6 || pwConfirmInput.length !== 6) {
        alert('비밀번호는 숫자 6자리로 입력해 주세요!');
        return;
    }

    if (pwInput !== pwConfirmInput) {
        alert('비밀번호가 일치하지 않습니다!');
        return;
    }

    // 모의 DB에 신규 가입자 추가
    const newId = mockUsers.length + 1;
    mockUsers.push({
        id: newId,
        name: nameInput,
        phone: phoneInput,
        role: 'user',
        blocked: false
    });

    currentUserRole = 'user';
    currentUserName = nameInput;
    currentUserPhone = phoneInput;

    alert(`🎁 회원가입이 완료되었습니다!\n\n${currentUserName}님, 붕어짱에 오신 것을 진심으로 환영합니다!`);
    updateSettingsUI();
    navigateTo('scr-dough');
}

// 설정 화면 프로필 및 분기 노출 UI 업데이트
function updateSettingsUI() {
    const nicknameSetting = document.getElementById('user-nickname-setting');
    const phoneSetting = document.getElementById('user-phone-setting');
    const badgeSetting = document.getElementById('user-badge-setting');
    const avatarSetting = document.getElementById('user-avatar-setting');
    const btnAdminConsole = document.getElementById('btn-admin-console');

    if (nicknameSetting) nicknameSetting.textContent = currentUserName;
    if (phoneSetting) phoneSetting.textContent = currentUserPhone ? currentUserPhone : '비로그인 상태';

    if (badgeSetting) {
        if (currentUserRole === 'admin') {
            badgeSetting.textContent = '최고관리자';
            badgeSetting.style.backgroundColor = '#EAD9C9';
            badgeSetting.style.color = '#8A6443';
        } else if (currentUserPhone) {
            badgeSetting.textContent = '인증 회원';
            badgeSetting.style.backgroundColor = '#D4E3D2';
            badgeSetting.style.color = '#2E7D32';
        } else {
            badgeSetting.textContent = '비인증 게스트';
            badgeSetting.style.backgroundColor = '#F5EFE6';
            badgeSetting.style.color = '#5D4037';
        }
    }

    if (avatarSetting) {
        avatarSetting.textContent = currentUserRole === 'admin' ? '👑' : '🐟';
    }

    if (btnAdminConsole) {
        if (currentUserRole === 'admin') {
            btnAdminConsole.style.display = 'flex';
        } else {
            btnAdminConsole.style.display = 'none';
        }
    }
}

// 로그아웃 처리
function handleLogout() {
    currentUserRole = 'user';
    currentUserName = '비회원 고객';
    currentUserPhone = '';
    alert('로그아웃 되었습니다. 인트로 화면으로 이동합니다.');
    updateSettingsUI();
    navigateTo('scr-intro');
}

// 비밀 우회 관리자 기능: 소개 페이지에서 로고 5회 연타 시 자동 로그인 및 콘솔 진입
let logoTapCount = 0;
function secretAdminTap() {
    logoTapCount++;
    if (logoTapCount === 5) {
        logoTapCount = 0;
        currentUserRole = 'admin';
        currentUserName = '붕어대장';
        currentUserPhone = '최고관리자';
        alert('🔑 [Secret Bypass] 로고를 5회 터치하여 최고관리자(Admin) 권한으로 자동 마스터 로그인하였습니다!');
        updateSettingsUI();
        renderAdminUsers();
        renderAdminReviews();
        navigateTo('scr-admin-console');
    }
}

// 관리자 콘솔 탭 전환 제어
function switchAdminTab(tabName) {
    document.getElementById('admin-sec-users').style.display = 'none';
    document.getElementById('admin-sec-reviews').style.display = 'none';
    document.getElementById('admin-sec-register').style.display = 'none';

    document.getElementById('tab-admin-users').classList.remove('active');
    document.getElementById('tab-admin-reviews').classList.remove('active');
    document.getElementById('tab-admin-register').classList.remove('active');

    if (tabName === 'users') {
        document.getElementById('admin-sec-users').style.display = 'flex';
        document.getElementById('tab-admin-users').classList.add('active');
        renderAdminUsers();
    } else if (tabName === 'reviews') {
        document.getElementById('admin-sec-reviews').style.display = 'flex';
        document.getElementById('tab-admin-reviews').classList.add('active');
        renderAdminReviews();
    } else if (tabName === 'register') {
        document.getElementById('admin-sec-register').style.display = 'flex';
        document.getElementById('tab-admin-register').classList.add('active');
    }
}

// 회원관리 리스트 렌더링
function renderAdminUsers() {
    const listContainer = document.getElementById('admin-users-list');
    const countSpan = document.getElementById('admin-users-count');
    if (!listContainer) return;

    countSpan.textContent = `총 ${mockUsers.length}명`;
    listContainer.innerHTML = '';

    mockUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.style.backgroundColor = '#FFF';
        userCard.style.borderRadius = '16px';
        userCard.style.padding = '14px 16px';
        userCard.style.boxShadow = '0 2px 8px rgba(62,39,35,0.03)';
        userCard.style.border = '1px solid rgba(62,39,35,0.05)';
        userCard.style.display = 'flex';
        userCard.style.flexDirection = 'column';
        userCard.style.gap = '8px';

        if (user.blocked) {
            userCard.style.opacity = '0.6';
            userCard.style.backgroundColor = '#F5EFEF';
        }

        userCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 14px; font-weight: 800; color: #3E2723;">${user.name}</span>
                    <span style="font-size: 11px; margin-left: 6px; font-weight: 700; padding: 2px 6px; border-radius: 8px; ${user.role === 'admin' ? 'background-color: #EAD9C9; color: #8A6443;' : 'background-color: #F5EFE6; color: #8D6E63;'}">${user.role === 'admin' ? '관리자' : '일반'}</span>
                </div>
                <span style="font-size: 12px; color: #7A7A7A; font-weight: 600;">${user.phone}</span>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
                <button onclick="toggleUserRole(${user.id})" style="border: 1px solid #D38E32; background: transparent; color: #D38E32; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; outline: none;">
                    권한 변경
                </button>
                <button onclick="toggleUserBlock(${user.id})" style="border: 1px solid ${user.blocked ? '#4CAF50' : '#E53935'}; background: transparent; color: ${user.blocked ? '#4CAF50' : '#E53935'}; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; outline: none;">
                    ${user.blocked ? '차단 해제' : '차단'}
                </button>
            </div>
        `;
        listContainer.appendChild(userCard);
    });
}

// 회원 권한 조작
function toggleUserRole(id) {
    const user = mockUsers.find(u => u.id === id);
    if (!user) return;

    if (user.phone === '010-0000-0000') {
        alert('최고 관리자 계정의 권한은 변경할 수 없습니다.');
        return;
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    alert(`[관리자] ${user.name} 회원의 권한을 ${user.role === 'admin' ? '관리자(Admin)' : '일반 회원(User)'}으로 변경하였습니다.`);
    renderAdminUsers();
}

// 회원 차단 조작
function toggleUserBlock(id) {
    const user = mockUsers.find(u => u.id === id);
    if (!user) return;

    if (user.phone === '010-0000-0000') {
        alert('최고 관리자 계정은 차단할 수 없습니다.');
        return;
    }

    user.blocked = !user.blocked;
    alert(`[관리자] ${user.name} 회원을 ${user.blocked ? '차단 완료' : '차단 해제'} 처리하였습니다.`);
    renderAdminUsers();
}

// 리뷰관리 리스트 렌더링
function renderAdminReviews() {
    const listContainer = document.getElementById('admin-reviews-list');
    const countSpan = document.getElementById('admin-reviews-count');
    if (!listContainer) return;

    countSpan.textContent = `총 ${mockReviews.length}건`;
    listContainer.innerHTML = '';

    mockReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.style.backgroundColor = '#FFF';
        reviewCard.style.borderRadius = '16px';
        reviewCard.style.padding = '14px 16px';
        reviewCard.style.boxShadow = '0 2px 8px rgba(62,39,35,0.03)';
        reviewCard.style.border = '1px solid rgba(62,39,35,0.05)';
        reviewCard.style.display = 'flex';
        reviewCard.style.flexDirection = 'column';
        reviewCard.style.gap = '6px';

        if (review.blinded) {
            reviewCard.style.opacity = '0.6';
            reviewCard.style.backgroundColor = '#F5EFEF';
        }

        reviewCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; font-weight: 800; color: #3E2723;">${review.author}</span>
                <span style="font-size: 11px; color: #FFB300; font-weight: 700;">${'⭐'.repeat(review.stars)}</span>
            </div>
            <p style="font-size: 12px; color: #5D4037; margin: 0; line-height: 1.45; font-weight: 500;">
                ${review.blinded ? '<span style="color: #E53935; font-weight: 700;">[블라인드 처리됨]</span> ' + review.content : review.content}
            </p>
            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
                <button onclick="toggleReviewBlind(${review.id})" style="border: 1px solid #D38E32; background: transparent; color: #D38E32; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; outline: none;">
                    ${review.blinded ? '블라인드 해제' : '블라인드'}
                </button>
                <button onclick="deleteReview(${review.id})" style="border: 1px solid #E53935; background: transparent; color: #E53935; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; outline: none;">
                    삭제
                </button>
            </div>
        `;
        listContainer.appendChild(reviewCard);
    });
}

// 리뷰 블라인드 조작
function toggleReviewBlind(id) {
    const review = mockReviews.find(r => r.id === id);
    if (!review) return;

    review.blinded = !review.blinded;
    alert(`[관리자] 해당 리뷰를 ${review.blinded ? '블라인드 설정' : '블라인드 해제'} 하였습니다.`);
    renderAdminReviews();
}

// 리뷰 삭제 조작
function deleteReview(id) {
    if (confirm('이 리뷰를 완전히 삭제하시겠습니까?')) {
        mockReviews = mockReviews.filter(r => r.id !== id);
        alert('[관리자] 리뷰가 영구 삭제되었습니다.');
        renderAdminReviews();
    }
}

// 신규 상품 등록 (실시간 DOM 추가 연동)
function adminSubmitProduct() {
    const category = document.getElementById('reg-prod-category').value;
    const name = document.getElementById('reg-prod-name').value.trim();
    const price = document.getElementById('reg-prod-price').value.trim();
    const desc = document.getElementById('reg-prod-desc').value.trim();

    if (!name || !price || !desc) {
        alert('모든 상품 정보를 정확하게 기입해주세요!');
        return;
    }

    const formattedPrice = parseInt(price, 10).toLocaleString();

    // 동적 렌더링에 적절하게 아이템 주입
    if (category === 'dough') {
        const doughGrid = document.querySelector('#scr-dough .grid-2x2');
        if (doughGrid) {
            const newCard = document.createElement('div');
            newCard.className = 'menu-card';
            newCard.onclick = function() { selectDough(newCard, name.toLowerCase()); };
            newCard.innerHTML = `
                <div class="fish-circle-wrap">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #FFF3E0; display: flex; justify-content: center; align-items: center; font-size: 32px;">🐟</div>
                    <span class="material-icons-round select-check-badge">check_circle</span>
                </div>
                <h4>${name}</h4>
                <p>${desc}</p>
            `;
            doughGrid.appendChild(newCard);
        }
    } else if (category === 'ingredient') {
        const ingGrid = document.querySelector('#scr-ingredients .grid-2x2');
        if (ingGrid) {
            const newCard = document.createElement('div');
            newCard.className = 'menu-card';
            newCard.onclick = function() { selectIngredient(newCard, name.toLowerCase()); };
            newCard.innerHTML = `
                <div class="fish-circle-wrap">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #E8F5E9; display: flex; justify-content: center; align-items: center; font-size: 32px;">🍯</div>
                    <span class="material-icons-round select-check-badge">check_circle</span>
                </div>
                <h4>${name}</h4>
                <p>${desc}</p>
            `;
            ingGrid.appendChild(newCard);
        }
    } else if (category === 'beverage') {
        const bevContent = document.querySelector('#scr-beverages .screen-content');
        if (bevContent) {
            const newCard = document.createElement('div');
            newCard.className = 'drink-card-new';
            newCard.onclick = function() { addDrinkToCartAndNavigate(name, parseInt(price, 10), 'iced_coffee.png'); };
            newCard.style.position = 'relative';
            newCard.style.marginBottom = '16px';
            newCard.style.cursor = 'pointer';
            newCard.style.overflow = 'hidden';
            newCard.style.borderRadius = '24px';
            newCard.style.boxShadow = '0 8px 24px rgba(62,39,35,0.06)';
            newCard.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            newCard.innerHTML = `
                <div style="width: 100%; height: 180px; background-color: #E1F5FE; display: flex; justify-content: center; align-items: center; font-size: 64px;">☕</div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 24px 20px 14px 20px; display: flex; justify-content: space-between; align-items: flex-end; color: #FFF;">
                    <div>
                        <h4 style="margin: 0; font-size: 18px; font-weight: 800; color: #FFF; text-shadow: 0 1px 4px rgba(0,0,0,0.6);">${name}</h4>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #E0E0E0; text-shadow: 0 1px 2px rgba(0,0,0,0.6);">${desc}</p>
                    </div>
                    <span style="font-size: 19px; font-weight: 900; color: #FFF; background-color: #D38E32; padding: 4px 12px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">₩${formattedPrice}</span>
                </div>
            `;

            // 가이드 멘트 문구 앞에 삽입
            const hint = bevContent.querySelector('p');
            if (hint) {
                bevContent.insertBefore(newCard, hint);
            } else {
                bevContent.appendChild(newCard);
            }
        }
    }

    alert(`[상품 등록 완료]\n\n분류: ${category === 'dough' ? '도우' : category === 'ingredient' ? '속재료' : '음료'}\n상품명: ${name}\n가격: ₩${formattedPrice}\n\n등록한 신규 메뉴가 실시간으로 사용자 메뉴판에 반영되었습니다!`);

    // 필드 클리어
    document.getElementById('reg-prod-name').value = '';
    document.getElementById('reg-prod-price').value = '';
    document.getElementById('reg-prod-desc').value = '';
}