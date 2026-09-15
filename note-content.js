"use strict";
// Expanded example material. These examples are separate from user-authored notes.
function enrichSamples(notes) {
  const block = (id, title, html, priority = 2, optional = false) => ({
    id,
    title,
    html,
    priority,
    optional,
    type: "text",
    source: "ai",
  });
  const extra = {
    "os-07": {
      overview: [
        "필요한 페이지만 메모리에 적재하고, 없으면 페이지 폴트로 가져온다.",
        "빈 공간이 없을 때는 FIFO·LRU 등의 기준으로 교체할 페이지를 고른다.",
        "페이지 폴트는 비용이 크므로, 횟수를 줄이는 것이 성능의 핵심이다.",
      ],
      blocks: [
        block(
          "os-why",
          "왜 가상 메모리가 필요할까?",
          "<p>프로세스마다 연속된 주소 공간을 제공하면서, 실제 물리 메모리는 여러 프로세스가 나누어 사용한다. 프로그램 전체가 메모리에 올라와 있지 않아도 실행할 수 있어 한정된 공간을 효율적으로 쓴다.</p><ul><li><strong>주소 공간 분리:</strong> 서로 다른 프로세스가 같은 가상 주소를 사용해도 다른 물리 프레임에 연결될 수 있다.</li><li><strong>보호:</strong> 운영체제는 페이지별 접근 권한을 검사한다.</li><li><strong>효율:</strong> 당장 쓰지 않는 부분은 디스크에 두고 필요한 부분부터 적재한다.</li></ul>",
        ),
        block(
          "os-replace",
          "페이지 교체 기준 비교",
          "<p>빈 프레임이 없으면 기존 페이지를 하나 내보내야 한다. 무엇을 교체하느냐에 따라 이후 페이지 폴트 횟수가 달라진다.</p><table><thead><tr><th>알고리즘</th><th>교체 기준</th><th>기억할 점</th></tr></thead><tbody><tr><td><strong>FIFO</strong></td><td>가장 먼저 들어온 페이지</td><td>구현이 단순하지만 자주 쓰는 페이지도 내보낼 수 있다.</td></tr><tr><td><strong>LRU</strong></td><td>가장 오래 참조하지 않은 페이지</td><td>최근 사용 이력을 관리하는 비용이 필요하다.</td></tr><tr><td><strong>OPT</strong></td><td>앞으로 가장 늦게 참조할 페이지</td><td>미래를 알아야 하므로 비교를 위한 이론적 기준이다.</td></tr></tbody></table>",
          3,
        ),
        block(
          "os-walkthrough",
          "계산 예제 · FIFO와 LRU",
          "<p>프레임은 3개, 참조 순서는 <strong>1 → 2 → 3 → 1 → 4</strong>라고 하자. 처음 세 번은 빈 프레임을 채우므로 모두 페이지 폴트다.</p><table><thead><tr><th>단계</th><th>FIFO</th><th>LRU</th></tr></thead><tbody><tr><td>1, 2, 3 적재</td><td>[1, 2, 3]</td><td>[1, 2, 3]</td></tr><tr><td>1 재참조</td><td>교체 없음. 들어온 순서는 유지.</td><td>교체 없음. 1이 가장 최근 참조됨.</td></tr><tr><td>4 참조</td><td>먼저 들어온 1 교체 → [4, 2, 3]</td><td>가장 오래 안 쓴 2 교체 → [1, 4, 3]</td></tr></tbody></table><p>여기까지는 둘 다 폴트가 <strong>4번</strong>이다. 다음에 1을 참조하면 FIFO는 폴트가 나지만 LRU는 메모리에서 바로 찾는다.</p>",
          2,
          true,
        ),
        block(
          "os-locality",
          "지역성과 스래싱",
          "<p><strong>시간 지역성</strong>은 최근 사용한 데이터를 다시 사용할 가능성이 높다는 뜻이고, <strong>공간 지역성</strong>은 가까운 주소를 함께 사용할 가능성이 높다는 뜻이다.</p><p>프로세스가 자주 쓰는 페이지 집합을 충분히 메모리에 유지하지 못하면 페이지를 내보내자마자 다시 가져오는 일이 반복된다. 이렇게 실제 실행보다 페이지 교체에 많은 시간을 쓰는 상태가 <strong>스래싱(thrashing)</strong>이다.</p><ul><li>작업 집합에 필요한 프레임을 충분히 확보한다.</li><li>메모리 경쟁이 심하면 동시에 실행하는 프로세스 수를 조절한다.</li><li>페이지 폴트 빈도가 높다는 사실만으로 CPU 연산이 복잡하다고 판단하지 않는다.</li></ul>",
        ),
        block(
          "os-pitfalls",
          "헷갈리기 쉬운 세 가지",
          "<ul><li><strong>페이지 폴트 ≠ 항상 오류:</strong> 유효한 페이지가 아직 메모리에 없는 정상적인 상황에서도 발생한다. 잘못된 주소 접근은 별도 처리가 필요하다.</li><li><strong>TLB 미스 ≠ 페이지 폴트:</strong> TLB에 없더라도 페이지 테이블을 통해 메모리의 프레임을 찾을 수 있다.</li><li><strong>프레임을 늘리면 항상 유리할까?</strong> FIFO는 특정 참조 순서에서 프레임이 늘어도 폴트가 증가하는 벨라디의 역설이 나타날 수 있다.</li></ul>",
          3,
        ),
        block(
          "os-review",
          "이해 점검 · 답을 보기 전에 생각하기",
          "<ol><li>페이지 폴트가 나면 운영체제는 어떤 순서로 처리할까?</li><li>최근에 참조한 페이지를 FIFO가 교체할 수 있는 이유는 무엇일까?</li><li>디스크 접근이 드물어도 평균 접근 시간이 크게 증가하는 이유는 무엇일까?</li></ol><p><strong>확인:</strong> 접근 유효성 확인 → 프레임 확보·필요 시 교체 → 페이지 적재 → 페이지 테이블 갱신 → 명령 재실행. FIFO는 참조 시점이 아닌 적재 순서를 사용한다. 디스크 접근 시간이 메모리 접근보다 훨씬 크기 때문에 작은 확률도 평균에 크게 기여한다.</p>",
          2,
          true,
        ),
      ],
    },
    "os-06": {
      overview: [
        "가상 주소는 페이지 번호와 오프셋으로 나뉜다.",
        "페이지 테이블이 페이지 번호를 물리 프레임에 연결한다.",
        "TLB는 최근 주소 변환 결과를 저장해 조회 비용을 줄인다.",
      ],
      blocks: [
        block(
          "memory-address",
          "가상 주소에서 물리 주소로",
          "<p>CPU가 만든 가상 주소는 <strong>페이지 번호 + 페이지 내부 오프셋</strong>으로 나눈다. 페이지 번호로 페이지 테이블을 조회해 프레임 번호를 얻고, 원래 오프셋을 이어 붙여 물리 주소를 만든다.</p><p>페이지와 프레임의 크기가 같으므로, 변환 과정에서 오프셋은 바뀌지 않는다. 달라지는 것은 어느 프레임을 가리키느냐이다.</p>",
          3,
        ),
        block(
          "memory-example",
          "주소 변환 계산 예제",
          "<p>페이지 크기가 4KB(4,096바이트)이고 가상 주소가 10,000이라고 하자.</p><ol><li>페이지 번호: 10,000 ÷ 4,096의 몫 = <strong>2</strong></li><li>오프셋: 나머지 = <strong>1,808</strong></li><li>페이지 2가 프레임 5에 연결되면 물리 주소 = 5 × 4,096 + 1,808 = <strong>22,288</strong></li></ol><p>4KB = 2¹²바이트이므로 바이트 주소 방식에서는 하위 12비트가 오프셋이다.</p>",
          2,
          true,
        ),
        block(
          "memory-tlb",
          "TLB가 빨라지는 이유",
          "<p><strong>TLB</strong>는 최근 가상 페이지와 물리 프레임의 연결을 저장하는 작은 캐시다. 적중하면 페이지 테이블을 따로 읽지 않고 주소를 변환할 수 있다.</p><table><thead><tr><th>상황</th><th>처리</th></tr></thead><tbody><tr><td>TLB 적중</td><td>캐시된 변환 정보를 사용한다.</td></tr><tr><td>TLB 미스</td><td>페이지 테이블에서 변환 정보를 찾는다.</td></tr><tr><td>페이지가 메모리에 없음</td><td>페이지 폴트 처리로 필요한 페이지를 가져온다.</td></tr></tbody></table>",
          3,
        ),
        block(
          "memory-fragment",
          "내부 단편화와 외부 단편화",
          "<p><strong>내부 단편화</strong>는 할당된 공간 안에서 남는 부분이다. 페이징에서는 마지막 페이지의 일부가 사용되지 않을 수 있다.</p><p><strong>외부 단편화</strong>는 비어 있는 공간이 여러 작은 조각으로 흩어진 상태다. 고정 크기 프레임을 사용하는 기본 페이징은 프로세스를 연속된 물리 공간에 넣을 필요가 없어 외부 단편화 문제를 완화한다.</p>",
        ),
        block(
          "memory-check",
          "복습 체크포인트",
          "<ul><li>페이지 번호와 오프셋을 직접 계산할 수 있는가?</li><li>페이지 테이블과 TLB의 역할 차이를 설명할 수 있는가?</li><li>TLB 미스가 항상 디스크 접근을 뜻하지 않는 이유를 설명할 수 있는가?</li></ul>",
          2,
          true,
        ),
      ],
    },
    "algo-04": {
      overview: [
        "상태에 어떤 값을 저장할지 먼저 정한다.",
        "작은 문제의 답으로 점화식을 만들고 초기값을 정한다.",
        "계산 순서와 복잡도를 확인한 뒤 공간을 줄인다.",
      ],
      blocks: [
        block(
          "dp-steps",
          "문제를 푸는 순서",
          "<ol><li><strong>상태 정의:</strong> dp[i]가 무엇을 의미하는지 한 문장으로 적는다.</li><li><strong>점화식:</strong> 현재 답을 만들기 위해 어떤 이전 상태가 필요한지 찾는다.</li><li><strong>초기값:</strong> 더 작은 문제로 나눌 수 없는 경우를 채운다.</li><li><strong>계산 순서:</strong> 참조할 값이 먼저 계산되도록 반복 순서를 정한다.</li></ol>",
          3,
        ),
        block(
          "dp-methods",
          "메모이제이션과 테이블 채우기",
          "<table><thead><tr><th>방식</th><th>진행 방향</th><th>특징</th></tr></thead><tbody><tr><td>메모이제이션</td><td>큰 문제 → 필요한 작은 문제</td><td>재귀와 캐시를 사용한다. 실제로 필요한 상태만 계산하기 쉽다.</td></tr><tr><td>타뷸레이션</td><td>작은 문제 → 큰 문제</td><td>반복문으로 테이블을 채운다. 계산 순서를 직접 설계한다.</td></tr></tbody></table><p>두 방법 모두 같은 부분 문제를 다시 계산하지 않는다는 점이 핵심이다.</p>",
        ),
        block(
          "dp-stairs",
          "예제 · 계단 오르기",
          "<p>한 번에 1칸 또는 2칸 오를 수 있을 때 n칸까지 가는 방법의 수를 구해 보자. 마지막 이동은 1칸 또는 2칸 중 하나이므로 <strong>dp[n] = dp[n−1] + dp[n−2]</strong>다.</p><table><thead><tr><th>계단 수 n</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody><tr><td>방법의 수</td><td>1</td><td>2</td><td>3</td><td>5</td><td>8</td></tr></tbody></table><p>초기값 dp[1] = 1, dp[2] = 2에서 시작하면 n = 5의 답은 <strong>8</strong>이다.</p>",
          2,
          true,
        ),
        block(
          "dp-cost",
          "시간과 공간 복잡도",
          "<p>시간 복잡도는 보통 <strong>상태의 개수 × 상태 하나를 계산하는 비용</strong>으로 살펴본다. 계단 문제는 상태 n개를 각각 상수 시간에 계산하므로 O(n)이다.</p><p>직전 두 값만 필요하면 배열 전체를 저장하지 않고 변수 두 개로 계산해 공간을 O(1)로 줄일 수 있다. 다만 실제 경로를 복원해야 하는 문제라면 추가 정보를 보관해야 한다.</p>",
          3,
        ),
        block(
          "dp-errors",
          "자주 실수하는 부분",
          "<ul><li>가능하지 않은 상태를 0으로 두면 최솟값 계산에서 잘못된 답을 고를 수 있다.</li><li>0이 정상적인 답일 때는 0을 미계산 표시로 쓰지 않는다.</li><li>이전 단계 값과 현재 단계 값을 섞어 쓰지 않도록 반복문 방향을 확인한다.</li><li>문제에서 모듈러 연산을 요구하면 각 합산 단계에서 적용한다.</li></ul>",
        ),
        block(
          "dp-review",
          "스스로 설명해 보기",
          "<p>“왜 이 상태 정의로 충분한가?”, “어떤 이전 상태가 현재 답을 만드는가?”, “이 순서로 계산해도 필요한 값이 준비되어 있는가?”를 각각 설명해 보자.</p><p>점화식만 외우는 것보다 상태의 의미와 계산 순서를 함께 설명할 수 있는지가 중요하다.</p>",
          2,
          true,
        ),
      ],
    },
    "math-03": {
      overview: [
        "선형 변환은 덧셈과 스칼라 곱을 보존한다.",
        "행렬의 각 열은 기저벡터가 이동한 결과다.",
        "행렬 곱은 변환의 합성을 나타내며 적용 순서가 중요하다.",
      ],
      blocks: [
        block(
          "linear-condition",
          "선형성의 두 조건",
          "<ul><li><strong>덧셈 보존:</strong> T(u + v) = T(u) + T(v)</li><li><strong>스칼라 곱 보존:</strong> T(cu) = cT(u)</li></ul><p>이 조건에서 T(0) = 0이 따라 나온다. 따라서 원점을 다른 위치로 옮기는 평행이동은 보통의 벡터 공간에서 선형 변환이 아니다.</p>",
          3,
        ),
        block(
          "linear-basis",
          "행렬의 열을 읽는 방법",
          "<p>2차원 표준 기저를 e₁ = (1, 0), e₂ = (0, 1)이라고 하자. 행렬 A의 첫 번째 열은 Ae₁이고, 두 번째 열은 Ae₂다.</p><p>임의의 벡터 x = x₁e₁ + x₂e₂에 대해 <strong>Ax = x₁Ae₁ + x₂Ae₂</strong>다. 두 기저벡터가 어디로 가는지만 알면 모든 벡터의 변환을 계산할 수 있다.</p>",
          3,
        ),
        block(
          "linear-calc",
          "계산 예제 · 축 방향 확대",
          "<p>A = [[2, 0], [0, 3]], x = (1, 2)일 때 Ax = <strong>(2, 6)</strong>이다. x축 방향은 2배, y축 방향은 3배 확대된다.</p><p>e₁은 (2, 0)으로, e₂는 (0, 3)으로 이동한다. x는 e₁ + 2e₂이므로 변환된 결과는 (2, 0) + 2(0, 3) = (2, 6)이다.</p>",
          2,
          true,
        ),
        block(
          "linear-compose",
          "행렬 곱과 변환 순서",
          "<p>벡터에 B를 적용한 다음 A를 적용하면 결과는 <strong>A(Bx) = (AB)x</strong>다. 열벡터 표기에서는 오른쪽 행렬부터 적용한다.</p><p>확대한 뒤 회전하는 것과 회전한 뒤 축별로 다르게 확대하는 것은 결과가 다를 수 있다. 일반적으로 AB와 BA는 같지 않다.</p>",
        ),
        block(
          "linear-inverse",
          "역행렬과 정보의 보존",
          "<p>역행렬 A⁻¹이 존재하면 변환된 벡터에서 원래 벡터로 돌아갈 수 있다. 서로 다른 벡터를 같은 점으로 보내는 변환은 정보를 잃기 때문에 원래 값을 하나로 복원할 수 없다.</p><p>정사각행렬에서 행렬식이 0이 아니라면 역행렬이 존재한다. 2차원에서 |det(A)|는 변환이 넓이를 몇 배로 바꾸는지를 나타낸다.</p>",
        ),
        block(
          "linear-review",
          "복습 질문",
          "<ol><li>왜 평행이동은 일반적인 선형 변환이 아닐까?</li><li>A의 첫 번째 열은 어떤 벡터의 변환 결과일까?</li><li>ABx에서 먼저 적용하는 변환은 무엇일까?</li></ol><p><strong>확인:</strong> 원점 보존, 첫 번째 기저벡터, B부터 적용.</p>",
          2,
          true,
        ),
      ],
    },
    "algo-03": {
      overview: [
        "입력을 나누고, 부분 문제를 풀고, 결과를 합친다.",
        "병합 정렬은 합치는 단계에서 정렬 순서를 만든다.",
        "각 깊이에서 O(n)의 일을 하고 깊이는 O(log n)이다.",
      ],
      blocks: [
        block(
          "merge-three",
          "분할 · 정복 · 결합",
          "<ol><li><strong>분할:</strong> 배열을 절반으로 나눈다.</li><li><strong>정복:</strong> 각 부분 배열을 재귀적으로 정렬한다.</li><li><strong>결합:</strong> 정렬된 두 부분 배열을 작은 원소부터 합친다.</li></ol><p>배열 길이가 0 또는 1이면 이미 정렬된 것으로 보고 재귀를 끝낸다.</p>",
          3,
        ),
        block(
          "merge-worked",
          "예제 · [8, 3, 5, 1] 정렬",
          "<p>[8, 3, 5, 1]을 [8, 3]과 [5, 1]로 나눈 뒤 각각을 다시 한 원소 배열로 나눈다.</p><ol><li>[8]과 [3]을 합쳐 <strong>[3, 8]</strong>을 만든다.</li><li>[5]와 [1]을 합쳐 <strong>[1, 5]</strong>를 만든다.</li><li>두 배열의 앞 원소를 비교하며 1 → 3 → 5 → 8 순으로 합친다.</li></ol><p>한쪽 배열이 먼저 비면 나머지 배열의 원소는 그대로 이어 붙인다.</p>",
          2,
          true,
        ),
        block(
          "merge-complexity",
          "왜 O(n log n)일까?",
          "<p>길이가 n인 배열을 계속 반으로 나누면 재귀 깊이는 O(log n)이다. 같은 깊이에 있는 부분 배열의 길이를 모두 더하면 n이므로, 병합에 필요한 작업은 깊이마다 O(n)이다.</p><p>따라서 전체 작업량은 <strong>O(n) × O(log n) = O(n log n)</strong>이다. 일반적인 배열 구현은 병합을 위한 O(n)의 보조 공간을 사용한다.</p>",
          3,
        ),
        block(
          "merge-stable",
          "안정 정렬의 의미",
          "<p>값이 같은 원소들의 기존 상대 순서를 유지하면 안정 정렬이라고 부른다. 병합할 때 두 값이 같으면 왼쪽 배열의 원소를 먼저 선택하면 안정성을 유지할 수 있다.</p><p>예를 들어 이름순으로 정렬한 목록을 성적순으로 안정 정렬하면, 같은 성적 안에서는 이름순이 유지된다.</p>",
        ),
        block(
          "merge-compare",
          "다른 정렬과 비교",
          "<table><thead><tr><th>정렬</th><th>시간 복잡도</th><th>선택 기준</th></tr></thead><tbody><tr><td>병합 정렬</td><td>최악 O(n log n)</td><td>일정한 성능과 안정성이 필요할 때</td></tr><tr><td>퀵 정렬</td><td>평균 O(n log n), 최악 O(n²)</td><td>피벗 선택과 입력 특성 고려</td></tr><tr><td>삽입 정렬</td><td>최악 O(n²)</td><td>작거나 거의 정렬된 입력에 유리할 수 있음</td></tr></tbody></table>",
        ),
        block(
          "merge-review",
          "구현 전 체크",
          "<ul><li>재귀 종료 조건이 올바른가?</li><li>양쪽 배열의 인덱스를 별도로 관리하는가?</li><li>남은 원소를 복사하는가?</li><li>같은 값일 때 안정성을 유지하는가?</li></ul>",
          2,
          true,
        ),
      ],
    },
  };
  for (const n of notes) {
    const e = extra[n.id];
    if (!e) continue;
    n.overview = e.overview;
    n.contentRevision = 2;
    n.blocks.push(...e.blocks);
    if (n.id === "os-07") {
      n.blocks.find((b) => b.id === "demand").title = "요구 페이징";
      const order = [
        "os-why",
        "demand",
        "analogy",
        "process",
        "os-replace",
        "formula",
        "os-locality",
        "os-pitfalls",
        "os-walkthrough",
        "os-review",
        "memo",
      ];
      n.blocks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    }
  }
}
function upgradeSavedSamples(saved, originals, enriched) {
  for (const n of saved) {
    if (!n.sample || n.contentRevision >= 2) continue;
    const original = originals.find((x) => x.id === n.id),
      fresh = enriched.find((x) => x.id === n.id);
    if (!original || !fresh) continue;
    if (
      n.blocks.length === original.blocks.length &&
      n.blocks.every(
        (b, i) =>
          b.id === original.blocks[i].id &&
          b.html === original.blocks[i].html &&
          b.title === original.blocks[i].title &&
          b.priority === original.blocks[i].priority &&
          b.source === original.blocks[i].source &&
          b.type === original.blocks[i].type &&
          b.formula === original.blocks[i].formula,
      )
    ) {
      n.blocks = structuredClone(fresh.blocks);
      n.overview = structuredClone(fresh.overview);
      n.contentRevision = 2;
      continue;
    }
    const baseline = new Set(original.blocks.map((b) => b.id));
    const additions = fresh.blocks.filter(
      (b) => !baseline.has(b.id) && !n.blocks.some((x) => x.id === b.id),
    );
    n.blocks.push(...structuredClone(additions));
    n.overview = structuredClone(fresh.overview);
    n.contentRevision = 2;
  }
}
function overviewHTML(n) {
  return n.overview?.length
    ? `<section class="note-overview" aria-label="핵심 요약"><span class="overview-label">${icon("book")} 한눈에 정리</span><ul>${n.overview.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>`
    : "";
}
