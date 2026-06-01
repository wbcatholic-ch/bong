/* prayer.js — 기도문 모듈
   카테고리·즐겨찾기·검색·상세보기·글자크기 */


/* ════════════════════════════════════════════════════════
   기도문 모듈 (Prayer Module)
════════════════════════════════════════════════════════ */
(function(){

const PR_CATS = ["favorites", "basic", "special", "bong2", "etc", "aim", "bong1", "bong3"];
const PR_CAT_STYLE = {
  favorites:{ label:'⭐ 즐겨찾기', bg:'#FFF0DC', color:'#E8780C', icon:'⭐', accent:'#E8780C' },
  aim:      { label:'대구대교구 인준', bg:'#E3F0FF', color:'#1565C0', icon:'✝️', accent:'#1565C0' },
  basic:    { label:'주요 기도', bg:'#EFF4FF', color:'#1E40AF', icon:'🏰', accent:'#1E40AF' },
  special:  { label:'특수 기도', bg:'#FFF0F5', color:'#BE185D', icon:'🙏', accent:'#BE185D' },
  etc:      { label:'여러가지 기도', bg:'#F0FDF4', color:'#15803D', icon:'📖', accent:'#15803D' },
  bong1:    { label:'위령기도', bg:'#F1F5F9', color:'#475569', icon:'🕊️', accent:'#475569' },
  bong2:    { label:'레지오 마리애', bg:'#FDF4FF', color:'#7E22CE', icon:'✨', accent:'#7E22CE' },
  bong3:    { label:'십자가의 길', bg:'#FFF7ED', color:'#C2410C', icon:'✞',  accent:'#C2410C' },
};

// 기도문 목록에서 좌우 스와이프 직후 즐겨찾기 별 오작동을 막는 공통 차단 시간
let prSwipeBlockUntil = 0;
// 첫 진입 때 활성 탭을 부드럽게 스크롤하면 탭바가 살짝 흔들려 보일 수 있어 첫 1회만 즉시 정렬한다.
let prTabsFirstAlign = true;
// 링크 테스트 상세 화면에서 자동 이동 예약이 중복 실행되지 않도록 관리한다.
let prExternalOpenTimer = null;

// 기도문 데이터 (링크 테스트: 앱 내부 본문은 두지 않고 공식/원문 URL만 보관)
const PR_DATA = {
  "basic": [
    {
      "id": "basic_014",
      "title": "성호경",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#14"
    },
    {
      "id": "basic_015",
      "title": "주님의 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#15"
    },
    {
      "id": "basic_016",
      "title": "성모송",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#16"
    },
    {
      "id": "basic_017",
      "title": "영광송",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#17"
    },
    {
      "id": "basic_018",
      "title": "사도신경",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#18"
    },
    {
      "id": "basic_019",
      "title": "니케아-콘스탄티노폴리스 신경",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#19"
    },
    {
      "id": "basic_020",
      "title": "반성기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#20"
    },
    {
      "id": "basic_021",
      "title": "십계명",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#21"
    },
    {
      "id": "basic_022",
      "title": "고백기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#22"
    },
    {
      "id": "basic_023",
      "title": "통회기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#23"
    },
    {
      "id": "basic_024",
      "title": "삼덕송",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#24"
    },
    {
      "id": "basic_025",
      "title": "봉헌기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#25"
    },
    {
      "id": "basic_026",
      "title": "삼종기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#26"
    },
    {
      "id": "basic_027",
      "title": "부활 삼종기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#27"
    },
    {
      "id": "basic_028",
      "title": "묵주기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#28"
    },
    {
      "id": "basic_029",
      "title": "식사 전 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#29"
    },
    {
      "id": "basic_030",
      "title": "식사 후 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#30"
    },
    {
      "id": "basic_031",
      "title": "일을 시작하며 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#31"
    },
    {
      "id": "basic_032",
      "title": "일을 마치고 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#32"
    },
    {
      "id": "basic_033",
      "title": "아침기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#33"
    },
    {
      "id": "basic_034",
      "title": "저녁기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#34"
    },
    {
      "id": "basic_035",
      "title": "고해성사",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=basic#35"
    }
  ],
  "special": [
    {
      "id": "special_010",
      "title": "성 요셉 성월",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#10"
    },
    {
      "id": "special_011",
      "title": "성모성월",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#11"
    },
    {
      "id": "special_012",
      "title": "예수 성심 성월",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#12"
    },
    {
      "id": "special_013",
      "title": "순교자 성월",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#13"
    },
    {
      "id": "special_014",
      "title": "묵주기도성월",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#14"
    },
    {
      "id": "special_015",
      "title": "위령성월",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#15"
    },
    {
      "id": "special_016",
      "title": "예수 성심 호칭 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#16"
    },
    {
      "id": "special_017",
      "title": "성모 호칭 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#17"
    },
    {
      "id": "special_018",
      "title": "성 요셉 호칭 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#18"
    },
    {
      "id": "special_019",
      "title": "103위 한국 성인 호칭 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#19"
    },
    {
      "id": "special_020",
      "title": "성인 호칭 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#20"
    },
    {
      "id": "special_023",
      "title": "124위 한국 순교 복자 호칭 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=special#23"
    }
  ],
  "bong2": [
    {
      "id": "bong2_003",
      "title": "레지오 마리애의 기도문",
      "url": "https://maria.catholic.or.kr/mi_pr/prayer/prayer.asp?menu=prayer&pgubun=6&ingId=142"
    }
  ],
  "etc": [
    {
      "id": "etc_003",
      "title": "성수기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#3"
    },
    {
      "id": "etc_004",
      "title": "예수 성심께 바치는 봉헌 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#4"
    },
    {
      "id": "etc_005",
      "title": "성모 성심께 바치는 봉헌 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#5"
    },
    {
      "id": "etc_006",
      "title": "성모께 자기를 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#6"
    },
    {
      "id": "etc_007",
      "title": "성 토마스의 성체 찬미가",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#7"
    },
    {
      "id": "etc_008",
      "title": "성 암브로시오의 사은 찬미가",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#8"
    },
    {
      "id": "etc_009",
      "title": "교황이나 주교를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#9"
    },
    {
      "id": "etc_010",
      "title": "사제들을 위한 기도 1",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#10"
    },
    {
      "id": "etc_011",
      "title": "사제들을 위한 기도 2",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#11"
    },
    {
      "id": "etc_012",
      "title": "수도자들을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#12"
    },
    {
      "id": "etc_013",
      "title": "평신도 사도직을 위한 기도 1",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#13"
    },
    {
      "id": "etc_014",
      "title": "평신도 사도직을 위한 기도 2",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#14"
    },
    {
      "id": "etc_015",
      "title": "비신자들을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#15"
    },
    {
      "id": "etc_016",
      "title": "성소를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#16"
    },
    {
      "id": "etc_017",
      "title": "그리스도교 일치를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#17"
    },
    {
      "id": "etc_018",
      "title": "민족의 화해와 일치를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#18"
    },
    {
      "id": "etc_019",
      "title": "성서 사도직을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#19"
    },
    {
      "id": "etc_020",
      "title": "복음화를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#20"
    },
    {
      "id": "etc_021",
      "title": "대중매체 선용을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#21"
    },
    {
      "id": "etc_022",
      "title": "성전 건립 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#22"
    },
    {
      "id": "etc_023",
      "title": "가정을 위한 기도 1",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#23"
    },
    {
      "id": "etc_024",
      "title": "가정을 위한 기도 2",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#24"
    },
    {
      "id": "etc_025",
      "title": "부모를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#25"
    },
    {
      "id": "etc_026",
      "title": "자녀를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#26"
    },
    {
      "id": "etc_027",
      "title": "부부의 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#27"
    },
    {
      "id": "etc_028",
      "title": "군인의 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#28"
    },
    {
      "id": "etc_034",
      "title": "군인을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#34"
    },
    {
      "id": "etc_035",
      "title": "병자를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#35"
    },
    {
      "id": "etc_037",
      "title": "선종을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#37"
    },
    {
      "id": "etc_039",
      "title": "세상을 떠난 부모를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#39"
    },
    {
      "id": "etc_040",
      "title": "세상을 떠난 형제, 친척, 친구, 은인을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#40"
    },
    {
      "id": "etc_041",
      "title": "새해를 맞이하며 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#41"
    },
    {
      "id": "etc_042",
      "title": "가뭄과 장마 때의 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#42"
    },
    {
      "id": "etc_043",
      "title": "하느님 자비를 구하는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc"
    }
  ],
  "aim": [
    {
      "id": "aim_029",
      "title": "2027 서울 세계청년대회 공식 기도문",
      "url": "https://wydseoul.org/introduction/prayer"
    },
    {
      "id": "aim_028",
      "title": "교황 선출을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#28"
    },
    {
      "id": "aim_027",
      "title": "프란치스코 교황의 영원한 안식을 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#27"
    },
    {
      "id": "aim_024",
      "title": "전례의 해 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#24"
    },
    {
      "id": "aim_023",
      "title": "친교의 해 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#23"
    },
    {
      "id": "aim_022",
      "title": "가경자 최양업 토마스 신부 시복 시성 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#22"
    },
    {
      "id": "aim_021",
      "title": "시노드를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#21"
    },
    {
      "id": "aim_020",
      "title": "말씀의 해 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#20"
    },
    {
      "id": "aim_019",
      "title": "성 김대건 안드레아 신부님 탄생 200주년 희년 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#19"
    },
    {
      "id": "aim_018",
      "title": "프란치스코 교황님의 성모님께 바치는 기도2",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#18"
    },
    {
      "id": "aim_017",
      "title": "프란치스코 교황님의 성모님께 바치는 기도1",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#17"
    },
    {
      "id": "aim_016",
      "title": "성 알퐁소 데 리구오리의 영적 영성체를 위한 기도2 (성체조배 중에)",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#16"
    },
    {
      "id": "aim_015",
      "title": "성 알퐁소 데 리구오리의 영적 영성체를 위한 기도1 (‘묵주의 9일기도’ 중에서)",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#15"
    },
    {
      "id": "aim_012",
      "title": "선교와 냉담교우 초대를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#12"
    },
    {
      "id": "aim_011",
      "title": "장신호 요한보스코 보좌주교를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#11"
    },
    {
      "id": "aim_010",
      "title": "자비의 희년에 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#10"
    },
    {
      "id": "aim_009",
      "title": "우리의 지구를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#9"
    },
    {
      "id": "aim_008",
      "title": "그리스도인들이 피조물과 함께 드리는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#8"
    },
    {
      "id": "aim_007",
      "title": "민족의 화해와 일치를 위한 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#7"
    },
    {
      "id": "aim_006",
      "title": "시복 시성 기도문",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#6"
    },
    {
      "id": "aim_005",
      "title": "새로운 100년을 시작하며 바치는 기도문",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#5"
    },
    {
      "id": "aim_004",
      "title": "교구설정 100주년 기도문",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#4"
    },
    {
      "id": "aim_003",
      "title": "이윤일 요한 성인께 바치는 기도",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer#3"
    }
  ],
  "bong1": [
    {
      "id": "bong1_002",
      "title": "위령기도",
      "url": "https://maria.catholic.or.kr/mobile/prayer/prayer.asp?pgubun=10&ingId=33"
    }
  ],
  "bong3": [
    {
      "id": "bong3_001",
      "title": "십자가의 길",
      "url": "https://www.daegu-archdiocese.or.kr/page/catholic_life.html?srl=prayer&category=etc#1"
    }
  ],
  "favorites": []
};

// ─── 기도문 모듈 상태 ────────────────────────────────────────────────────────
// 기도문 기능 전용 상태를 별도 객체로 분리합니다.
// 기존 코드 호환을 위해 레거시 변수명을 getter/setter로 연결합니다.
const PrayerState = {
  curCat:    'basic',// 현재 선택된 카테고리 키
  favorites: [],     // 즐겨찾기 기도문 ID 배열
  fontIdx:   3,      // 글자 크기 인덱스
  inited:    false,  // 초기화 여부
  listScroll:0,      // 본문에서 목록으로 돌아올 때 복원할 위치
  listItemId:''      // 선택했던 기도문 위치 보정용
};
(function installPrayerProxy() {
  const map = [
    ['prCurCat',    'curCat'],
    ['prFavorites', 'favorites'],
    ['prFontIdx',   'fontIdx'],
    ['prInited',    'inited'],
  ];
  map.forEach(function([legacyName, key]) {
    Object.defineProperty(window, legacyName, {
      get: function() { return PrayerState[key]; },
      set: function(v) { PrayerState[key] = v; },
      configurable: true,
      enumerable: false,
    });
  });
})();
const PR_FONT_SIZES = [13,14,15,16,17,18,19,20,21,22,24,26,28,30];
const PR_FONT_KEY = 'prayer_font_size';
const PR_EXTERNAL_LEAVE_DELAY_MS = 720;
const PR_EXTERNAL_VEIL_HOLD_MS = 1050;
const PR_EXTERNAL_RETURN_VEIL_MS = 850;

function prG(id){ return document.getElementById(id); }
function prNorm(t){ return (t||'').replace(/\s+/g,'').toLowerCase(); }
function prNormalizeFavoriteIds(ids){
  const map = {
    bong1_001:'bong1_002',
    bong1_002:'bong1_002',
    bong2_001:'bong2_003',
    bong2_002:'bong2_003',
    bong2_003:'bong2_003'
  };
  const valid = new Set();
  PR_CATS.forEach(function(k){
    if(k === 'favorites') return;
    (PR_DATA[k] || []).forEach(function(p){ valid.add(p.id); });
  });
  const out = [];
  (ids || []).forEach(function(id){
    const next = map[id] || id;
    if(valid.has(next) && !out.includes(next)) out.push(next);
  });
  return out;
}
function prPrepareExternalVeilLabel(label){
  try{
    var root = document.documentElement;
    root.setAttribute('data-oai-prayer-external-label', label || '기도문 외부 홈페이지로 이동 중입니다.');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function prPreparePrayerExternalState(url){
  try{
    var now = Date.now ? Date.now() : new Date().getTime();
    sessionStorage.setItem('oai_prayer_external_return_to_list', '1');
    sessionStorage.setItem('oai_prayer_external_return_url', url || '');
    sessionStorage.setItem('oai_prayer_external_started_at', String(now));
    sessionStorage.setItem('oai_external_nav_started_at', String(now));
    sessionStorage.setItem('oai_external_nav_kind', 'prayer-official-link');
    sessionStorage.setItem('oai_external_nav_pending', '1');
    sessionStorage.removeItem('oai_external_nav_pagehide');
    sessionStorage.setItem('oai_external_nav_hold_until', String(now + PR_EXTERNAL_VEIL_HOLD_MS));
    sessionStorage.setItem('oai_external_nav_force_release_at', String(now + PR_EXTERNAL_VEIL_HOLD_MS + 260));
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function prOpenPrayerExternalUrl(url){
  var safeUrl = (url || '').trim();
  try{
    if(typeof normalizeCatholicExternalUrl === 'function') safeUrl = normalizeCatholicExternalUrl(safeUrl);
  }catch(_e){}
  if(!/^https?:\/\//i.test(safeUrl)) return false;
  prClearExternalOpenTimer();
  prPreparePrayerExternalState(safeUrl);
  prPrepareExternalVeilLabel('기도문 외부 홈페이지로 이동 중입니다.');
  try{
    document.documentElement.classList.add('oai-external-leaving');
    if(typeof oaiHoldStabilityVeil === 'function') oaiHoldStabilityVeil('external-leave', PR_EXTERNAL_VEIL_HOLD_MS);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  prExternalOpenTimer = setTimeout(function(){
    prExternalOpenTimer = null;
    try{ location.assign(safeUrl); }catch(e){ try{ location.href = safeUrl; }catch(_e){ console.warn('[가톨릭길동무]', _e); } }
  }, PR_EXTERNAL_LEAVE_DELAY_MS);
  return true;
}
function prClearExternalOpenTimer(){
  if(prExternalOpenTimer){
    clearTimeout(prExternalOpenTimer);
    prExternalOpenTimer = null;
  }
}

function prLoadPrefs(){
  try{ prFavorites = JSON.parse(localStorage.getItem('pr_favorites')||'[]'); }catch(e){ prFavorites=[]; }
  prFavorites = prNormalizeFavoriteIds(prFavorites);
  prSaveFavorites();
  const saved = (typeof window.__APP_getSharedFontPx === 'function')
    ? window.__APP_getSharedFontPx()
    : parseInt(localStorage.getItem(PR_FONT_KEY), 10);
  const idx = PR_FONT_SIZES.indexOf(saved);
  prFontIdx = idx >= 0 ? idx : 3;
}
function prSaveFavorites(){ try{ localStorage.setItem('pr_favorites', JSON.stringify(prFavorites)); }catch(e){ console.warn("[가톨릭길동무]", e); } }

function prApplyFont(){
  const px = PR_FONT_SIZES[prFontIdx];
  const r = document.getElementById('prayer-view');
  if(r){
    r.style.setProperty('--pr-item-fs',   px+'px');
    r.style.setProperty('--pr-body-fs',   px+'px');
    r.style.setProperty('--pr-detail-fs', (px+1)+'px');
    r.style.setProperty('--pr-icon-sz',   Math.max(34,Math.round(px*2.2))+'px');
    r.style.setProperty('--pr-icon-fs',   Math.max(17,Math.round(px*1.2))+'px');
  }
  try{ localStorage.setItem(PR_FONT_KEY, px); }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{
    if(typeof window.__APP_applyGlobalFont === 'function') window.__APP_applyGlobalFont();
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

window.prAdjustFont = function(delta){
  if(typeof window.__APP_adjustSharedFont === 'function'){
    const px = window.__APP_adjustSharedFont(delta);
    const idx = PR_FONT_SIZES.indexOf(px);
    if(idx >= 0) prFontIdx = idx;
    prApplyFont();
    return;
  }
  const saved = parseInt(localStorage.getItem(PR_FONT_KEY), 10);
  const savedIdx = PR_FONT_SIZES.indexOf(saved);
  if(savedIdx >= 0) prFontIdx = savedIdx;
  const next = prFontIdx + delta;
  if(next < 0 || next >= PR_FONT_SIZES.length) return;
  prFontIdx = next;
  prApplyFont();
};
window.prApplyFont = prApplyFont;

function prBuildTabs(){
  const wrap = prG('prayer-tabs');
  if(!wrap) return;
  wrap.innerHTML='';
  PR_CATS.forEach(cat=>{
    const st = PR_CAT_STYLE[cat];
    const btn = document.createElement('button');
    btn.className = 'pr-tab';
    btn.textContent = st.label;
    btn.dataset.cat = cat;
    btn.onclick = ()=>{ prSwitchCat(cat); };
    wrap.appendChild(btn);
  });
}

function prApplyTabColors(){
  let activeBtn = null;
  document.querySelectorAll('.pr-tab').forEach(btn=>{
    const on = btn.dataset.cat===prCurCat;
    btn.classList.toggle('on', on);
    if(on) activeBtn = btn;
  });
  if(activeBtn){
    var behavior = prTabsFirstAlign ? 'auto' : 'smooth';
    activeBtn.scrollIntoView({behavior:behavior, block:'nearest', inline:'center'});
  }
  prTabsFirstAlign = false;
  try{ if(typeof window.oaiKeepActiveTabsVisible === 'function') window.oaiKeepActiveTabsVisible('prayer'); }catch(e){ console.warn('[가톨릭길동무]', e); }
}

// V3-S: 주요기도문 탭 표시 안전장치.
// 일부 화면 전환/캐시 조합에서 목록은 렌더링되지만 탭 컨테이너가 비어 보이는 경우를 막는다.
function prEnsureTabsVisible(){
  const wrap = prG('prayer-tabs');
  if(!wrap) return;
  if(wrap.children.length < PR_CATS.length) prBuildTabs();
  wrap.style.display = 'flex';
  wrap.style.visibility = 'visible';
  wrap.style.opacity = '1';
  Array.from(wrap.children).forEach(function(btn){
    btn.style.display = 'flex';
    btn.style.visibility = 'visible';
    btn.style.opacity = '1';
  });
  prApplyTabColors();
}
window.prEnsureTabsVisible = prEnsureTabsVisible;
function prSwitchCat(cat){
  prCurCat = cat;
  const inp = prG('prayer-search-inp');
  const listView = prG('prayer-list-view');
  const detail = prG('prayer-detail');
  if(inp) inp.value = '';
  if(detail) detail.classList.remove('show');
  prApplyTabColors();
  prRenderList();
  if(listView){
    listView.style.scrollBehavior = 'auto';
    listView.scrollTop = 0;
    listView.style.scrollBehavior = '';
  }
}

window.prRenderList = function(){
  const ul = prG('pr-list-ul');
  if(!ul) return;
  ul.innerHTML = '';
  const kw = prNorm(prG('prayer-search-inp')?.value||'');
  let data = [];
  if(prCurCat === 'favorites'){
    PR_CATS.forEach(k=>{ if(k!=='favorites') data = data.concat(PR_DATA[k]||[]); });
    data = data.filter(p=>prFavorites.includes(p.id));
  } else if(kw){
    PR_CATS.forEach(k=>{ if(k!=='favorites') data = data.concat(PR_DATA[k]||[]); });
  } else {
    data = PR_DATA[prCurCat] || [];
  }
  const filtered = kw ? data.filter(p=>prNorm(p.title).includes(kw)) : data;
  if(!filtered.length){
    ul.innerHTML = '<li><div class="pr-empty">'+
      (prCurCat==='favorites'?'즐겨찾기한 기도문이 없습니다.':kw?'검색 결과가 없습니다.':'등록된 기도문이 없습니다.')+
      '</div></li>';
    return;
  }
  filtered.forEach(prayer=>{
    const cat2 = (prCurCat==='favorites'||kw) ? prGetCat(prayer.id) : prCurCat;
    const st = PR_CAT_STYLE[cat2] || PR_CAT_STYLE.aim;
    const isFav = prFavorites.includes(prayer.id);
    const li = document.createElement('li');
    li.className = 'pr-item';
    li.style.borderLeftColor = st.accent;
    li.innerHTML = '<div class="pr-item-left">'+
      '<div class="pr-icon-dot" style="background:'+st.bg+';color:'+st.color+'">'+st.icon+'</div>'+
      '<div class="pr-title">'+prayer.title+'</div>'+
      '</div>'+
      '<div class="pr-item-right">'+
      '<button type="button" class="pr-star '+(isFav?'on':'')+'" data-pid="'+prayer.id+'" aria-label="즐겨찾기">'+
        '<span aria-hidden="true">★</span></button>'+
      '<span class="pr-chevron" aria-hidden="true">›</span>'+
      '</div>';
    const starBtn = li.querySelector('.pr-star');
    let ignoreListClickUntil = 0;
    if(starBtn){
      let favHandledAt = 0;
      let suppressClickUntil = 0;
      let favTouch = null;
      const FAV_MOVE_X_LIMIT = 5;
      const FAV_MOVE_Y_LIMIT = 7;
      const FAV_MAX_TAP_MS = 450;

      function markFavTouch(ms){
        ignoreListClickUntil = Date.now() + (ms || 700);
        li.dataset.favTouch = '1';
        window.setTimeout(function(){
          if(Date.now() > ignoreListClickUntil) delete li.dataset.favTouch;
        }, (ms || 700) + 80);
      }
      function stopFavEvent(ev, preventDefault){
        if(!ev) return;
        if(preventDefault && typeof ev.preventDefault === 'function') ev.preventDefault();
        if(typeof ev.stopPropagation === 'function') ev.stopPropagation();
        if(typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
      }
      function favTouchPoint(ev){
        const t = ev && ev.changedTouches && ev.changedTouches[0] ? ev.changedTouches[0] :
                  ev && ev.touches && ev.touches[0] ? ev.touches[0] : ev;
        return { x: t && typeof t.clientX === 'number' ? t.clientX : 0,
                 y: t && typeof t.clientY === 'number' ? t.clientY : 0 };
      }
      function runFavToggle(ev){
        const now = Date.now();
        if(now < prSwipeBlockUntil) return;
        if(now - favHandledAt < 350) return;
        favHandledAt = now;
        prToggleFav(prayer.id, ev);
      }

      starBtn.addEventListener('touchstart', function(ev){
        const pt = favTouchPoint(ev);
        favTouch = {x:pt.x, y:pt.y, t:Date.now(), moved:false};
        markFavTouch(700);
        stopFavEvent(ev, false);
      }, {capture:true, passive:false});

      starBtn.addEventListener('touchmove', function(ev){
        if(favTouch){
          const pt = favTouchPoint(ev);
          if(Math.abs(pt.x - favTouch.x) > FAV_MOVE_X_LIMIT ||
             Math.abs(pt.y - favTouch.y) > FAV_MOVE_Y_LIMIT){
            favTouch.moved = true;
          }
        }
        markFavTouch(700);
        stopFavEvent(ev, false);
      }, {capture:true, passive:false});

      starBtn.addEventListener('touchcancel', function(ev){
        favTouch = null;
        suppressClickUntil = Date.now() + 450;
        markFavTouch(700);
        stopFavEvent(ev, false);
      }, {capture:true, passive:false});

      starBtn.addEventListener('touchend', function(ev){
        const now = Date.now();
        const touch = favTouch;
        favTouch = null;
        markFavTouch(700);
        suppressClickUntil = now + 450;
        stopFavEvent(ev, true);
        if(!touch) return;
        const pt = favTouchPoint(ev);
        const moved = touch.moved ||
          Math.abs(pt.x - touch.x) > FAV_MOVE_X_LIMIT ||
          Math.abs(pt.y - touch.y) > FAV_MOVE_Y_LIMIT;
        const tooLong = now - touch.t > FAV_MAX_TAP_MS;
        if(moved || tooLong || now < prSwipeBlockUntil) return;
        runFavToggle(ev);
      }, {capture:true, passive:false});

      starBtn.addEventListener('click', function(ev){
        markFavTouch(700);
        if(Date.now() < suppressClickUntil || Date.now() < prSwipeBlockUntil || Date.now() - favHandledAt < 350){
          stopFavEvent(ev, true);
          return;
        }
        stopFavEvent(ev, true);
        runFavToggle(ev);
      }, {capture:true, passive:false});
    }
    li.addEventListener('click', function(ev){
      if(Date.now() < ignoreListClickUntil || li.dataset.favTouch === '1' ||
         (ev.target && ev.target.closest && ev.target.closest('.pr-star'))){
        if(typeof ev.preventDefault === 'function') ev.preventDefault();
        if(typeof ev.stopPropagation === 'function') ev.stopPropagation();
        return;
      }
      prOpenDetail(prayer);
    });
    ul.appendChild(li);
  });
};

function prGetCat(id){
  for(const k in PR_DATA){ if((PR_DATA[k]||[]).find(p=>p.id===id)) return k; }
  return 'aim';
}

window.prToggleFav = function(id, e){
  if(e){
    if(typeof e.preventDefault === 'function') e.preventDefault();
    if(typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const lv = prG('prayer-list-view');
  const keepScroll = lv ? (lv.scrollTop || 0) : 0;
  prFavorites = prFavorites.includes(id) ? prFavorites.filter(f=>f!==id) : [...prFavorites,id];
  prSaveFavorites();
  prRenderList();
  if(lv){
    const restoreScroll = function(){
      try{
        lv.style.scrollBehavior = 'auto';
        lv.scrollTop = keepScroll;
        lv.style.scrollBehavior = '';
      }catch(_e){}
    };
    restoreScroll();
    requestAnimationFrame(restoreScroll);
    setTimeout(restoreScroll, 80);
    setTimeout(restoreScroll, 220);
  }
}
/* 본문 화면 즐겨찾기 토글 */
window.prToggleDetailFav = function(e){
  e.stopPropagation();
  var btn = document.getElementById('pr-detail-star');
  if(!btn) return;
  var id = btn.dataset.pid;
  if(!id) return;
  prFavorites = prFavorites.includes(id) ? prFavorites.filter(f=>f!==id) : [...prFavorites,id];
  prSaveFavorites();
  var isFav = prFavorites.includes(id);
  btn.classList.toggle('on', isFav);
  /* 목록 동기화 */
  var listBtn = document.querySelector('.pr-star[data-pid="'+id+'"]');
  if(listBtn) listBtn.classList.toggle('on', isFav);
};

function prOpenDetail(prayer){
  try{
    var __lv=prG('prayer-list-view');
    PrayerState.listScroll = __lv ? (__lv.scrollTop || 0) : 0;
    PrayerState.listItemId = prayer && prayer.id ? String(prayer.id) : '';
    window.__oaiPrayerListRestore = { scroll: PrayerState.listScroll, itemId: PrayerState.listItemId, cat: prCurCat };
    sessionStorage.setItem('oai_prayer_list_restore', JSON.stringify(window.__oaiPrayerListRestore));
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  const detail = prG('prayer-detail');
  const ttl = prG('prayer-detail-ttl');
  const content = prG('prayer-detail-content');
  const body = prG('prayer-detail-body');
  if(!detail) return;
  ttl.textContent = prayer.title;
  var safeTitle = (prayer.title || '기도문').replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; });
  var hasExternalUrl = !!(prayer && /^https?:\/\//i.test((prayer.url || '').trim()));
  if(hasExternalUrl){
    prOpenPrayerExternalUrl(prayer.url);
    return;
  }
  var rawContent = ((prayer.content||prayer.body||'')+'').replace(/class="symbol"/g,'class="pr-symbol"');
  content.innerHTML = '<div class="pr-body-title">' + safeTitle + '</div>' + rawContent;
  prClearExternalOpenTimer();
  detail.classList.add('show');
  try{
    // 본문 진입 시 별도 history state를 만들지 않고, 공통 앱 back trap만 보강한다.
    // 실제 뒤로가기는 patches.js의 공통 컨트롤러가 DOM 상태를 보고 처리한다.
    if(typeof window._oaiPrayerPushDetailState === 'function') window._oaiPrayerPushDetailState('prayer-detail-open');
    else if(typeof window._oaiArmPrayerBackTrap === 'function') window._oaiArmPrayerBackTrap('prayer-detail-open');
  }catch(e){
    console.warn('[가톨릭길동무]', e);
  }
  // 현재 기도문 ID 저장 → 본문 즐겨찾기 버튼에 반영
  detail.dataset.pid = prayer.id || '';
  var starBtn = prG('pr-detail-star');
  if(starBtn){
    var isFav = prFavorites.includes(prayer.id);
    starBtn.classList.toggle('on', isFav);
    starBtn.dataset.pid = prayer.id || '';
  }
  // 본문 맨 위로 즉시 이동
  if(body){ body.style.scrollBehavior='auto'; body.scrollTop=0; body.style.scrollBehavior=''; }
  setTimeout(function(){ if(body) body.scrollTop=0; }, 50);
}


function prRestoreListPosition(){
  try{
    const lv = prG('prayer-list-view');
    if(!lv) return;
    var saved = window.__oaiPrayerListRestore || null;
    if(!saved){ try{ saved = JSON.parse(sessionStorage.getItem('oai_prayer_list_restore') || 'null'); }catch(_e){ saved=null; } }
    const y = Number((saved && saved.scroll) || PrayerState.listScroll || 0);
    const itemId = (saved && saved.itemId) || PrayerState.listItemId || '';
    function apply(){
      try{
        lv.style.scrollBehavior = 'auto';
        lv.scrollTop = y;
        if(itemId){
          var item = document.querySelector('[data-pid="'+ itemId.replace(/"/g,'\"') +'"]');
          var li = item && item.closest ? item.closest('li,.pr-item,.pr-card') : null;
          if(li && y <= 2) li.scrollIntoView({block:'center', inline:'nearest'});
        }
        lv.style.scrollBehavior = '';
      }catch(_e){}
    }
    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 80);
    setTimeout(apply, 220);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
window.prRestoreListPosition = prRestoreListPosition;

window.prCloseDetail = function(opts){
  prClearExternalOpenTimer();
  const detail = prG('prayer-detail');
  if(detail) detail.classList.remove('show');
  prRestoreListPosition();
  if(!(opts && opts.skipTrap)){
    try{
      // 버튼으로 본문을 닫는 경우에도 별도 state를 만들지 않는다.
      // 공통 앱 back trap만 유지해 목록 단계에서 앱이 바로 종료되지 않게 한다.
      if(typeof window._oaiPrayerReplaceListState === 'function') window._oaiPrayerReplaceListState('prayer-detail-button-to-list');
      else if(typeof window._oaiArmPrayerBackTrap === 'function') window._oaiArmPrayerBackTrap('prayer-detail-button-to-list');
    }catch(e){
      console.warn('[가톨릭길동무]', e);
    }
  }
};

function prHandlePrayerExternalReturn(){
  try{
    if(sessionStorage.getItem('oai_prayer_external_return_to_list') !== '1') return;
    if(document.visibilityState && document.visibilityState === 'hidden') return;
    var started = parseInt(sessionStorage.getItem('oai_prayer_external_started_at') || '0', 10) || 0;
    if(started && Date.now && Date.now() - started > 10 * 60 * 1000){
      sessionStorage.removeItem('oai_prayer_external_return_to_list');
      sessionStorage.removeItem('oai_prayer_external_return_url');
      sessionStorage.removeItem('oai_prayer_external_started_at');
      return;
    }
    sessionStorage.removeItem('oai_prayer_external_return_to_list');
    sessionStorage.removeItem('oai_prayer_external_return_url');
    sessionStorage.removeItem('oai_prayer_external_started_at');
    prClearExternalOpenTimer();
    var detail = prG('prayer-detail');
    if(detail) detail.classList.remove('show');
    prRestoreListPosition();
    prPrepareExternalVeilLabel('기도문 목록으로 돌아오는 중입니다.');
    try{
      var reason = document.documentElement.getAttribute('data-oai-stability-reason') || '';
      if(!/external-return/i.test(reason) && typeof oaiHoldStabilityVeil === 'function'){
        oaiHoldStabilityVeil('prayer-external-return', PR_EXTERNAL_RETURN_VEIL_MS);
      }
    }catch(_e){}
    try{
      if(typeof window._oaiArmPrayerBackTrap === 'function') window._oaiArmPrayerBackTrap('prayer-external-return-list');
    }catch(_e){}
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
window.addEventListener('pageshow', function(){ setTimeout(prHandlePrayerExternalReturn, 30); }, true);
window.addEventListener('focus', function(){ setTimeout(prHandlePrayerExternalReturn, 70); }, true);
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState === 'visible') setTimeout(prHandlePrayerExternalReturn, 70);
}, true);

/* ── IIFE 스코프 외부 노출 ── */
window.prSwitchCat = prSwitchCat;
window.prOpenDetail = prOpenDetail;
window.prCloseDetail = window.prCloseDetail;

/* ── 기도문 좌우 스와이프 (순환) — 웹사이트 기준 감도와 동일화 */
function prBindSwipeTabs(){
  var el = document.getElementById('prayer-list-view');
  if (!el || el.__prSwipeTabsBound) return;
  el.__prSwipeTabsBound = true;
  var sx = 0, sy = 0;
  var THRESHOLD = 32;
  var HORIZONTAL_RATIO = 1.03;
  var SWIPE_BLOCK_MS = 700;
  var horizontalLocked = false;

  function getIdx(cat) { return PR_CATS.indexOf(cat); }
  function blockFavAfterSwipe(){ prSwipeBlockUntil = Date.now() + SWIPE_BLOCK_MS; }
  function isHorizontalSwipe(dx, dy){
    return Math.abs(dx) >= THRESHOLD && Math.abs(dx) >= Math.abs(dy) * HORIZONTAL_RATIO;
  }
  function goNext() {
    var idx = getIdx(prCurCat);
    var next = (idx + 1) % PR_CATS.length; // 순환
    prSwitchCat(PR_CATS[next]);
    if(typeof window.oaiSwipeAction === 'function') window.oaiSwipeAction(document.getElementById('pr-list-ul'), 'left');
  }
  function goPrev() {
    var idx = getIdx(prCurCat);
    var prev = (idx - 1 + PR_CATS.length) % PR_CATS.length; // 순환
    prSwitchCat(PR_CATS[prev]);
    if(typeof window.oaiSwipeAction === 'function') window.oaiSwipeAction(document.getElementById('pr-list-ul'), 'right');
  }

  el.addEventListener('touchstart', function(e) {
    if(!e.touches || !e.touches[0]) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    horizontalLocked = false;
  }, { passive: true });
  el.addEventListener('touchmove', function(e) {
    if(!e.touches || !e.touches[0]) return;
    var dx = e.touches[0].clientX - sx;
    var dy = e.touches[0].clientY - sy;
    if(Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * HORIZONTAL_RATIO){
      horizontalLocked = true;
      blockFavAfterSwipe();
      if(e.cancelable) e.preventDefault();
    }
  }, { passive: false });
  el.addEventListener('touchend', function(e) {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * HORIZONTAL_RATIO) blockFavAfterSwipe();
    if (!isHorizontalSwipe(dx, dy)) return;
    if (dx < 0) goNext(); else goPrev();
  }, { passive: true });
}
window.prBindSwipeTabs = prBindSwipeTabs;
prBindSwipeTabs();


/* V18: 기도문 본문 좌우 스와이프 시 웹사이트와 같은 화살표 피드백만 복구 */
function prBindDetailSwipeArrow(){
  var body = document.getElementById('prayer-detail-body');
  if (!body || body.__prDetailSwipeArrowBound) return;
  body.__prDetailSwipeArrowBound = true;

  var sx = 0, sy = 0;
  var THRESHOLD = 44;
  var HORIZONTAL_RATIO = 1.18;

  body.addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches[0]) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });

  body.addEventListener('touchend', function(e){
    if (!e.changedTouches || !e.changedTouches[0]) return;
    var detail = document.getElementById('prayer-detail');
    if (!detail || !detail.classList.contains('show')) return;

    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < THRESHOLD) return;
    if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_RATIO) return;

    if (typeof window.oaiSwipeAction === 'function') {
      window.oaiSwipeAction(body, dx < 0 ? 'left' : 'right');
    }
  }, { passive: true });
}
window.prBindDetailSwipeArrow = prBindDetailSwipeArrow;
prBindDetailSwipeArrow();

/* lyTabColors: 미선언 전역 변수 - 참조하는 코드 없음, 제거 */

window.initPrayerView = function(){
  prLoadPrefs();
  prCurCat = (prFavorites && prFavorites.length) ? 'favorites' : 'basic';
  prBuildTabs();
  prApplyFont();
  prEnsureTabsVisible();
  prRenderList();
  prBindSwipeTabs();
  prBindDetailSwipeArrow();
  // 상세뷰 초기화
  const detail = prG('prayer-detail');
  const listView = prG('prayer-list-view');
  if(detail) detail.classList.remove('show');
  if(listView){
    listView.style.scrollBehavior = 'auto';
    listView.scrollTop = 0;
    listView.style.scrollBehavior = '';
  }
};

/* ─── 굿뉴스 기도문 버튼: 외부복귀 안정화 경로로 연결 ───────────────
   index.html의 <a target="_blank">를 JS로 오버라이드하여
   oaiSmoothNavigate() → markExternalReturnStabilize() → pageshow 복귀 흐름을 탄다.
   prayer.js는 동적 로드(첫 기도문 진입 시 1회)되므로 여기서 한 번만 바인딩한다. */
(function(){
  try{
    var btn = document.getElementById('goodnews-prayer-btn');
    if(!btn || btn.__oaiHandled) return;
    btn.__oaiHandled = true;
    btn.removeAttribute('target');
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var url = btn.getAttribute('href') || 'https://maria.catholic.or.kr/mobile/prayer/';
      if(typeof oaiSmoothNavigate === 'function'){
        oaiSmoothNavigate(url, 'prayer-goodnews');
      } else {
        try{ location.assign(url); }catch(_e){ location.href = url; }
      }
    });
  }catch(e){ console.warn('[가톨릭길동무]', e); }
})();

})();
