window.addEventListener('load', () => {
    /* -----------------------------------------------------------
        1. 슬라이더 로직 (섹션 2 내부)
    ----------------------------------------------------------- */
    const slideList = document.querySelector('.silde_list');
    const prevBtn = document.querySelector('.bt2 a:nth-child(1)');
    const nextBtn = document.querySelector('.bt2 a:nth-child(2)');

    if (slideList && prevBtn && nextBtn) {
        const moveDist = 798 + 96; // 슬라이드 너비 + 간격
        let isMoving = false;

        // 초기 설정: 마지막 슬라이드를 맨 앞으로 옮겨 무한루프 준비
        slideList.insertBefore(slideList.lastElementChild, slideList.firstElementChild);
        slideList.style.transform = `translateX(0px)`;

        // 다음 버튼
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isMoving) return;
            isMoving = true;

            slideList.style.transition = 'transform 0.5s ease-in-out';
            slideList.style.transform = `translateX(-${moveDist}px)`;

            setTimeout(() => {
                slideList.style.transition = 'none';
                slideList.appendChild(slideList.firstElementChild);
                slideList.style.transform = `translateX(0px)`;
                isMoving = false;
            }, 500);
        });

        // 이전 버튼
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isMoving) return;
            isMoving = true;

            slideList.style.transition = 'none';
            slideList.style.transform = `translateX(-${moveDist}px)`;
            slideList.insertBefore(slideList.lastElementChild, slideList.firstElementChild);
            slideList.offsetHeight; // Reflow 강제 발생

            slideList.style.transition = 'transform 0.5s ease-in-out';
            slideList.style.transform = `translateX(0px)`;

            setTimeout(() => {
                isMoving = false;
            }, 500);
        });
    }

    /* -----------------------------------------------------------
        2. 하이브리드 풀페이지 스크롤 & 페이지네이션
    ----------------------------------------------------------- */
    const wrap = document.querySelector('#wrap');
    const sections = document.querySelectorAll('.hero, .s1, .s2');
    const pageNum = document.querySelector('.page');
    const scrollBtn = document.querySelector('.scroll_down a');

    let currentIdx = 0;
    let isScrolling = false;
    const lastFullPageIdx = sections.length - 1; // 인덱스 2 (S2)

    // 페이지네이션 업데이트 함수
    function updatePagination(index) {
        if (!pageNum) return;
        if (index <= lastFullPageIdx) {
            pageNum.classList.remove('hide');
            pageNum.innerHTML = `${index + 1}<span> / 3</span>`;
        } else {
            pageNum.classList.add('hide');
        }
    }

    /* moveSection 함수 부분만 이렇게 교체하세요 */

    function moveSection(index) {
        if (index < 0 || index > lastFullPageIdx) return;

        isScrolling = true;
        currentIdx = index;

        const moveTop = index * window.innerHeight;

        // 1. 위로 밀어 올리기
        wrap.style.top = `-${moveTop}px`;

        // 2. [핵심] 밀려 올라간 만큼 마진을 깎아서 아래쪽 공백을 지워버림
        // 이 코드가 있어야 S3와 Footer가 바짝 따라 올라옵니다.
        wrap.style.marginBottom = `-${moveTop}px`;

        updatePagination(index);

        setTimeout(() => {
            isScrolling = false;
        }, 800);
    }

    // 휠 이벤트
    window.addEventListener('wheel', (e) => {
        const delta = e.deltaY;

        // [CASE 1] 마지막 풀페이지(S2) 위치에 있을 때
        if (currentIdx === lastFullPageIdx) {
            // 위로 올릴 때 + 브라우저 스크롤이 맨 위(0)일 때만 풀페이지 복귀
            if (delta < 0 && window.scrollY <= 0) {
                if (isScrolling) return;
                e.preventDefault();
                moveSection(lastFullPageIdx - 1);
            }
            // 아래로 내려갈 때는 일반 스크롤이므로 페이지네이션 숨김 (S3 영역 진입)
            else if (delta > 0) {
                if (pageNum) pageNum.classList.add('hide');
            }
            return; // 그 외(S3나 Footer 스크롤 중)에는 브라우저 기본 스크롤 허용
        }

        // [CASE 2] 풀페이지 구간 (Hero, S1)
        if (currentIdx < lastFullPageIdx) {
            e.preventDefault(); // 브라우저 기본 스크롤 방지
            if (isScrolling) return;

            if (delta > 0) {
                moveSection(currentIdx + 1);
            } else if (delta < 0 && currentIdx > 0) {
                moveSection(currentIdx - 1);
            }
        }
    }, { passive: false });

    // 히어로 섹션 스크롤 다운 버튼 클릭 시 섹션 1로 이동
    if (scrollBtn) {
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isScrolling) moveSection(1);
        });
    }

    // 초기 상태 설정
    updatePagination(0);
});