'use client';

import { useState, useEffect, useRef } from 'react';
import { HomeIcon, MatchIcon, RankIcon, MoreIcon } from '../components/Icons';
import PremiumButton from '../components/PremiumButton';

// PC 설정 정답 상수
const PC_ANSWERS = {
  sales: {
    ip: '100.0.0.1',
    subnet: '255.192.0.0',
    gateway: '100.63.255.254',
    dns: '10.10.10.10'
  },
  manage: {
    ip: '100.129.0.1',
    subnet: '255.192.0.0',
    gateway: '100.191.255.254',
    dns: '10.10.10.10'
  }
};

// 스위치 명령어 단계 (정보기기.md 기반)
const SWITCH_STEPS = [
  { normalized: 'enable', display: 'en', help: '특권 실행 모드로 전환 (enable)' },
  { normalized: 'configure terminal', display: 'conf t', help: '글로벌 설정 모드로 전환 (configure terminal)' },
  { normalized: 'interface vlan 10', display: 'int vl 10', help: 'VLAN 10 인터페이스 진입 (interface vlan 10)' },
  { normalized: 'ip address 100.0.0.2 255.192.0.0', display: 'ip add 100.0.0.2 255.192.0.0', help: 'IP 주소 및 서브넷 마스크 설정' },
  { normalized: 'no shutdown', display: 'no sh', help: '인터페이스 활성화 (no shutdown)' },
  { normalized: 'ip default-gateway 100.63.255.254', display: 'ip de 100.63.255.254', help: '디폴트 게이트웨이 지정' },
  { normalized: 'vlan 10', display: 'vl 10', help: 'VLAN 10 생성' },
  { normalized: 'name Sales', display: 'na Sales', help: 'VLAN 10 이름 설정 (Sales)' },
  { normalized: 'vlan 20', display: 'vl 20', help: 'VLAN 20 생성' },
  { normalized: 'name Manage', display: 'na Manage', help: 'VLAN 20 이름 설정 (Manage)' },
  { normalized: 'exit', display: 'ex', help: '이전 모드로 나가기 (exit)' },
  { normalized: 'interface range fastethernet 0/1-10', display: 'int ra f0/1-10', help: '포트 범위 1~10번 선택' },
  { normalized: 'switchport mode access', display: 'sw mo acc', help: '액세스 모드로 포트 설정' },
  { normalized: 'switchport access vlan 10', display: 'sw acc vl 10', help: '포트를 VLAN 10에 할당' },
  { normalized: 'interface range fastethernet 0/11-20', display: 'int ra f0/11-20', help: '포트 범위 11~20번 선택' },
  { normalized: 'switchport mode access', display: 'sw mo acc', help: '액세스 모드로 포트 설정' },
  { normalized: 'switchport access vlan 20', display: 'sw acc vl 20', help: '포트를 VLAN 20에 할당' },
  { normalized: 'interface range fastethernet 0/24', display: 'int ra f0/24', help: '포트 24번 선택' },
  { normalized: 'switchport mode trunk', display: 'sw mo tr', help: '트렁크 모드로 포트 설정' },
  { normalized: 'switchport trunk allowed vlan 10,20', display: 'sw tr all vl 10,20', help: '트렁크 허용 VLAN 지정' }
];

// 라우터 명령어 단계
const ROUTER_STEPS = [
  { normalized: 'enable', display: 'en', help: '특권 실행 모드 진입 (enable)' },
  { normalized: 'configure terminal', display: 'conf t', help: '글로벌 설정 모드 진입 (configure terminal)' },
  { normalized: 'interface fastethernet 0/0', display: 'int f0/0', help: 'FastEthernet 0/0 인터페이스 선택' },
  { normalized: 'no shutdown', display: 'no sh', help: '인터페이스 활성화 (no shutdown)' },
  { normalized: 'interface fastethernet 0/0.10', display: 'int f0/0.10', help: 'VLAN 10용 서브인터페이스 진입' },
  { normalized: 'encapsulation dot1q 10', display: 'en d 10', help: 'VLAN 10 캡슐화 방식 지정 (encapsulation dot1Q 10)' },
  { normalized: 'ip address 100.63.255.254 255.192.0.0', display: 'ip add 100.63.255.254 255.192.0.0', help: '서브인터페이스 IP 할당' },
  { normalized: 'interface fastethernet 0/0.20', display: 'int f0/0.20', help: 'VLAN 20용 서브인터페이스 진입' },
  { normalized: 'encapsulation dot1q 20', display: 'en d 20', help: 'VLAN 20 캡슐화 지정' },
  { normalized: 'ip address 100.191.255.254 255.192.0.0', display: 'ip add 100.191.255.254 255.192.0.0', help: '서브인터페이스 IP 할당' },
  { normalized: 'interface serial 0/0/0', display: 'int s0/0/0', help: 'Serial 0/0/0 인터페이스 진입' },
  { normalized: 'ip address 172.30.0.9 255.255.255.252', display: 'ip add 172.30.0.9 255.255.255.252', help: '시리얼 IP 설정' },
  { normalized: 'clock rate 64000', display: 'cl ra 64000', help: '클록 레이트 지정' },
  { normalized: 'router rip', display: 'rou rip', help: 'RIP 라우팅 프로토콜 활성화' },
  { normalized: 'version 2', display: 'v2', help: 'RIP 버전 2 활성화' },
  { normalized: 'network 100.0.0.0', display: 'ne 100.0.0.0', help: '네트워크 대역 등록 (100.0.0.0)' },
  { normalized: 'network 100.128.0.0', display: 'ne 100.128.0.0', help: '네트워크 대역 등록 (100.128.0.0)' },
  { normalized: 'network 172.30.0.8', display: 'ne 172.30.0.8', help: '네트워크 대역 등록 (172.30.0.8)' },
  { normalized: 'passive-interface fastethernet 0/0.10', display: 'pass f0/0.10', help: 'VLAN 10 RIP 브로드캐스트 광고 차단' },
  { normalized: 'passive-interface fastethernet 0/0.20', display: 'pass f0/0.20', help: 'VLAN 20 RIP 광고 차단' }
];

// 명령어 정규화 파서
function normalizeCommand(cmd) {
  let temp = cmd.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // enable
  if (temp === 'en' || temp === 'ena' || temp === 'enable') return 'enable';
  // configure terminal
  if (temp === 'conf t' || temp === 'config t' || temp === 'configure terminal') return 'configure terminal';
  
  // exit
  if (temp === 'ex' || temp === 'exit') return 'exit';
  // no shutdown
  if (temp === 'no sh' || temp === 'no shut' || temp === 'no shutdown') return 'no shutdown';
  
  // interface vlan 10
  if (temp.startsWith('int vl ')) {
    return 'interface vlan ' + temp.substring(7);
  }
  if (temp.startsWith('interface vlan ')) {
    return temp;
  }

  // ip address ...
  if (temp.startsWith('ip add ')) {
    return 'ip address ' + temp.substring(7);
  }
  if (temp.startsWith('ip address ')) {
    return temp;
  }

  // ip default-gateway ...
  if (temp.startsWith('ip de ')) {
    return 'ip default-gateway ' + temp.substring(6);
  }
  if (temp.startsWith('ip default-gateway ')) {
    return temp;
  }

  // vlan ...
  if (temp.startsWith('vl ')) {
    return 'vlan ' + temp.substring(3);
  }
  if (temp.startsWith('vlan ')) {
    return temp;
  }

  // name ...
  let rawTrim = cmd.trim();
  let rawLower = rawTrim.toLowerCase();
  if (rawLower.startsWith('na ')) {
    return 'name ' + rawTrim.substring(3).trim();
  }
  if (rawLower.startsWith('name ')) {
    return 'name ' + rawTrim.substring(5).trim();
  }

  // interface range ...
  if (rawLower.startsWith('int ra ')) {
    let port = rawLower.substring(7).trim();
    if (port.startsWith('f')) {
      port = 'fastethernet ' + port.substring(1);
    }
    return 'interface range ' + port;
  }
  if (rawLower.startsWith('interface range ')) {
    let port = rawLower.substring(16).trim();
    if (port.startsWith('f')) {
      port = 'fastethernet ' + port.substring(1);
    }
    return 'interface range ' + port;
  }

  // switchport mode access
  if (temp === 'sw mo acc' || temp === 'sw mode acc' || temp === 'switchport mode access') return 'switchport mode access';
  // switchport mode trunk
  if (temp === 'sw mo tr' || temp === 'sw mode tr' || temp === 'switchport mode trunk') return 'switchport mode trunk';

  // switchport access vlan ...
  if (temp.startsWith('sw acc vl ')) {
    return 'switchport access vlan ' + temp.substring(10);
  }
  if (temp.startsWith('switchport access vlan ')) {
    return temp;
  }

  // switchport trunk allowed vlan ...
  if (temp.startsWith('sw tr all vl ')) {
    return 'switchport trunk allowed vlan ' + temp.substring(13);
  }
  if (temp.startsWith('sw tr all vlan ')) {
    return 'switchport trunk allowed vlan ' + temp.substring(15);
  }
  if (temp.startsWith('switchport trunk allowed vlan ')) {
    return temp;
  }

  // interface fastethernet ...
  if (temp.startsWith('int f')) {
    let port = temp.substring(5).trim();
    if (port.startsWith('0')) {
      return 'interface fastethernet ' + port;
    }
  }
  if (temp.startsWith('interface fastethernet ')) {
    return temp;
  }

  // encapsulation dot1q ...
  if (temp.startsWith('en d ')) {
    return 'encapsulation dot1q ' + temp.substring(5);
  }
  if (temp.startsWith('encapsulation dot1q ')) {
    return temp;
  }

  // interface serial ...
  if (temp.startsWith('int s')) {
    let port = temp.substring(5).trim();
    if (port.startsWith('0')) {
      return 'interface serial ' + port;
    }
  }
  if (temp.startsWith('interface serial ')) {
    return temp;
  }

  // clock rate ...
  if (temp.startsWith('cl ra ')) {
    return 'clock rate ' + temp.substring(6);
  }
  if (temp.startsWith('clock rate ')) {
    return temp;
  }

  // router rip
  if (temp === 'rou rip' || temp === 'router rip') return 'router rip';
  // version 2
  if (temp === 'v2' || temp === 'version 2') return 'version 2';

  // network ...
  if (temp.startsWith('ne ')) {
    return 'network ' + temp.substring(3);
  }
  if (temp.startsWith('network ')) {
    return temp;
  }

  // passive-interface ...
  if (temp.startsWith('pass f')) {
    let port = temp.substring(5).trim();
    if (port.startsWith('0')) {
      return 'passive-interface fastethernet ' + port;
    }
  }
  if (temp.startsWith('passive-interface fastethernet ')) {
    return temp;
  }

  return temp;
}

// 동적 프롬프트 결정 함수
function getPrompt(mode, devName, cmdIndex, steps) {
  if (cmdIndex === 0) return `${devName}>`;
  
  let normalizedHistory = steps.slice(0, cmdIndex).map(s => s.normalized);
  
  let isConfig = false;
  let isIf = false;
  let isRouter = false;

  for (let i = 0; i < normalizedHistory.length; i++) {
    let cmd = normalizedHistory[i];
    if (cmd === 'enable') {
      isConfig = false;
      isIf = false;
      isRouter = false;
    } else if (cmd === 'configure terminal') {
      isConfig = true;
      isIf = false;
      isRouter = false;
    } else if (cmd.startsWith('interface ')) {
      isIf = true;
      isRouter = false;
    } else if (cmd === 'router rip') {
      isRouter = true;
      isIf = false;
    } else if (cmd === 'exit') {
      if (isIf || isRouter) {
        isIf = false;
        isRouter = false;
      } else if (isConfig) {
        isConfig = false;
      }
    }
  }

  if (isIf) return `${devName}(config-if)#`;
  if (isRouter) return `${devName}(config-router)#`;
  if (isConfig) return `${devName}(config)#`;
  return `${devName}#`;
}

// 인라인 SVG 아이콘 컴포넌트
const MonitorIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const ChartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const WrenchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const BoltIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{display:'inline-block',verticalAlign:'middle',marginRight:'4px'}}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [showDetails, setShowDetails] = useState(false);

  // PC 설정 상태
  const [salesConfig, setSalesConfig] = useState({ ip: '', subnet: '', gateway: '', dns: '' });
  const [manageConfig, setManageConfig] = useState({ ip: '', subnet: '', gateway: '', dns: '' });
  const [pcResult, setPcResult] = useState({ success: false, message: '' });

  // 스위치 CLI 상태
  const [switchCmd, setSwitchCmd] = useState('');
  const [switchStepIdx, setSwitchStepIdx] = useState(0);
  const [switchHistory, setSwitchHistory] = useState([
    { text: 'Switch line proto is down. Press Enter to activate.', type: 'system' },
    { text: 'Switch> (힌트: en 또는 enable을 입력해서 시작하셈)', type: 'system' }
  ]);

  // 라우터 CLI 상태
  const [routerCmd, setRouterCmd] = useState('');
  const [routerStepIdx, setRouterStepIdx] = useState(0);
  const [routerHistory, setRouterHistory] = useState([
    { text: 'Router line proto is down. Press Enter to activate.', type: 'system' },
    { text: 'Router> (힌트: en 또는 enable을 입력해서 시작하셈)', type: 'system' }
  ]);

  const switchEndRef = useRef(null);
  const routerEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'match' && switchEndRef.current) {
      switchEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [switchHistory, activeTab]);

  useEffect(() => {
    if (activeTab === 'rank' && routerEndRef.current) {
      routerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [routerHistory, activeTab]);

  // PC 설정 제출 처리
  const handlePcSubmit = () => {
    const isSalesCorrect =
      salesConfig.ip === PC_ANSWERS.sales.ip &&
      salesConfig.subnet === PC_ANSWERS.sales.subnet &&
      salesConfig.gateway === PC_ANSWERS.sales.gateway &&
      salesConfig.dns === PC_ANSWERS.sales.dns;

    const isManageCorrect =
      manageConfig.ip === PC_ANSWERS.manage.ip &&
      manageConfig.subnet === PC_ANSWERS.manage.subnet &&
      manageConfig.gateway === PC_ANSWERS.manage.gateway &&
      manageConfig.dns === PC_ANSWERS.manage.dns;

    if (isSalesCorrect && isManageCorrect) {
      setPcResult({
        success: true,
        message: '오! 완벽함. PC IP 설정 다 맞췄음! 스위치 설정 탭(두 번째 아이콘)으로 넘어가셈!'
      });
    } else {
      let errorMsg = '뭔가 틀렸음. 정보기기.md 다시 보고 오셈.\n';
      if (!isSalesCorrect) errorMsg += '• Sales PC 설정 확인 필요\n';
      if (!isManageCorrect) errorMsg += '• Manage PC 설정 확인 필요';
      setPcResult({
        success: false,
        message: errorMsg
      });
    }
  };

  // PC 정답 자동입력
  const autoFillPc = () => {
    setSalesConfig({
      ip: '100.0.0.1',
      subnet: '255.192.0.0',
      gateway: '100.63.255.254',
      dns: '10.10.10.10'
    });
    setManageConfig({
      ip: '100.129.0.1',
      subnet: '255.192.0.0',
      gateway: '100.191.255.254',
      dns: '10.10.10.10'
    });
  };

  // 스위치 명령어 입력 처리
  const handleSwitchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!switchCmd.trim()) return;

    const rawInput = switchCmd;
    const normalizedInput = normalizeCommand(rawInput);
    setSwitchCmd('');

    if (switchStepIdx >= SWITCH_STEPS.length) {
      setSwitchHistory(prev => [
        ...prev,
        { text: `Switch# ${rawInput}`, type: 'command' },
        { text: '스위치 설정은 이미 완료되었음! 더이상 입력할 필요 없음.', type: 'system' }
      ]);
      return;
    }

    const currentPrompt = getPrompt('Switch', 'Switch', switchStepIdx, SWITCH_STEPS);
    const expected = SWITCH_STEPS[switchStepIdx];

    if (normalizedInput === expected.normalized) {
      const nextIdx = switchStepIdx + 1;
      const nextPrompt = getPrompt('Switch', 'Switch', nextIdx, SWITCH_STEPS);
      
      setSwitchHistory(prev => [
        ...prev,
        { text: `${currentPrompt} ${rawInput}`, type: 'command' },
        { text: nextIdx >= SWITCH_STEPS.length ? '스위치 설정 완벽 클리어! 다음은 라우터다!' : `${nextPrompt}`, type: 'success' }
      ]);
      setSwitchStepIdx(nextIdx);
    } else {
      setSwitchHistory(prev => [
        ...prev,
        { text: `${currentPrompt} ${rawInput}`, type: 'command' },
        { text: `% Invalid input detected at '^' marker. (정답: ${expected.display})`, type: 'error' }
      ]);
    }
  };

  // 라우터 명령어 입력 처리
  const handleRouterSubmit = (e) => {
    if (e) e.preventDefault();
    if (!routerCmd.trim()) return;

    const rawInput = routerCmd;
    const normalizedInput = normalizeCommand(rawInput);
    setRouterCmd('');

    if (routerStepIdx >= ROUTER_STEPS.length) {
      setRouterHistory(prev => [
        ...prev,
        { text: `Router# ${rawInput}`, type: 'command' },
        { text: '라우터 설정 끝났음! 이제 정보 탭에서 합격 결과를 확인하셈.', type: 'system' }
      ]);
      return;
    }

    const currentPrompt = getPrompt('Router', 'Router', routerStepIdx, ROUTER_STEPS);
    const expected = ROUTER_STEPS[routerStepIdx];

    if (normalizedInput === expected.normalized) {
      const nextIdx = routerStepIdx + 1;
      const nextPrompt = getPrompt('Router', 'Router', nextIdx, ROUTER_STEPS);

      setRouterHistory(prev => [
        ...prev,
        { text: `${currentPrompt} ${rawInput}`, type: 'command' },
        { text: nextIdx >= ROUTER_STEPS.length ? '라우터 설정 완벽 클리어! 합격 커트라인 돌파!' : `${nextPrompt}`, type: 'success' }
      ]);
      setRouterStepIdx(nextIdx);
    } else {
      setRouterHistory(prev => [
        ...prev,
        { text: `${currentPrompt} ${rawInput}`, type: 'command' },
        { text: `% Invalid input detected at '^' marker. (정답: ${expected.display})`, type: 'error' }
      ]);
    }
  };

  const handleQuickClick = (text, tab) => {
    if (tab === 'switch') {
      setSwitchCmd(text);
    } else if (tab === 'router') {
      setRouterCmd(text);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="scroll-area animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0 24px 0' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '900', color: '#16a34a', letterSpacing: '1px' }}>Cisco 실습 #1</span>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1A1A1A' }}>PC IP 설정 (GUI)</h1>
              </div>
              <button 
                onClick={autoFillPc}
                style={{ fontSize: '11px', padding: '6px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#4b5563', fontFamily: 'Consolas, monospace' }}
              >
                Auto Fill
              </button>
            </div>

            <div className="premium-card">
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a', marginBottom: '16px', display: 'flex', alignItems: 'center' }}><MonitorIcon />Sales PC</h2>
              <div className="pc-config-form">
                <div className="input-group">
                  <span className="input-label">IP Address</span>
                  <input type="text" className="form-input" placeholder="100.0.0.1" value={salesConfig.ip} onChange={e => setSalesConfig({...salesConfig, ip: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">Subnet Mask</span>
                  <input type="text" className="form-input" placeholder="255.192.0.0" value={salesConfig.subnet} onChange={e => setSalesConfig({...salesConfig, subnet: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">Default Gateway</span>
                  <input type="text" className="form-input" placeholder="100.63.255.254" value={salesConfig.gateway} onChange={e => setSalesConfig({...salesConfig, gateway: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">DNS Server</span>
                  <input type="text" className="form-input" placeholder="10.10.10.10" value={salesConfig.dns} onChange={e => setSalesConfig({...salesConfig, dns: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="premium-card">
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a', marginBottom: '16px', display: 'flex', alignItems: 'center' }}><MonitorIcon />Manage PC</h2>
              <div className="pc-config-form">
                <div className="input-group">
                  <span className="input-label">IP Address</span>
                  <input type="text" className="form-input" placeholder="100.129.0.1" value={manageConfig.ip} onChange={e => setManageConfig({...manageConfig, ip: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">Subnet Mask</span>
                  <input type="text" className="form-input" placeholder="255.192.0.0" value={manageConfig.subnet} onChange={e => setManageConfig({...manageConfig, subnet: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">Default Gateway</span>
                  <input type="text" className="form-input" placeholder="100.191.255.254" value={manageConfig.gateway} onChange={e => setManageConfig({...manageConfig, gateway: e.target.value})} />
                </div>
                <div className="input-group">
                  <span className="input-label">DNS Server</span>
                  <input type="text" className="form-input" placeholder="10.10.10.10" value={manageConfig.dns} onChange={e => setManageConfig({...manageConfig, dns: e.target.value})} />
                </div>
              </div>
            </div>

            {pcResult.message && (
              <div className={`guide-box`} style={{ borderLeftColor: pcResult.success ? '#16a34a' : '#dc2626', background: pcResult.success ? '#f0fdf4' : '#fef2f2', marginBottom: '16px' }}>
                <h4 style={{ color: pcResult.success ? '#15803d' : '#991b1b' }}>{pcResult.success ? '성공!' : '오류 발생'}</h4>
                <p style={{ whiteSpace: 'pre-line', color: pcResult.success ? '#166534' : '#991b1b' }}>{pcResult.message}</p>
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <PremiumButton onClick={handlePcSubmit}>
                PC 설정 완료 & 검증
              </PremiumButton>
            </div>
            <div style={{ height: '30px' }}></div>
          </div>
        );

      case 'match':
        return (
          <div className="scroll-area animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0 24px 0' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '900', color: '#16a34a', letterSpacing: '1px' }}>Cisco 실습 #2</span>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1A1A1A' }}>Switch CLI 설정</h1>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#6b7280', fontFamily: 'Consolas, monospace' }}>
                진행도: {Math.round((switchStepIdx / SWITCH_STEPS.length) * 100)}%
              </div>
            </div>

            {switchStepIdx < SWITCH_STEPS.length ? (
              <div className="guide-box">
                <h4>[다음 가이드]</h4>
                <p>{SWITCH_STEPS[switchStepIdx].help} ({SWITCH_STEPS[switchStepIdx].display})</p>
              </div>
            ) : (
              <div className="guide-box" style={{ background: '#f0fdf4', borderLeftColor: '#16a34a' }}>
                <h4 style={{ display: 'flex', alignItems: 'center' }}><CheckCircleIcon />Switch 설정 완료!</h4>
                <p>스위치 설정을 끝냈음. 이제 세 번째 탭(라우터 아이콘)으로 넘어가서 라우터 설정하셈!</p>
              </div>
            )}

            <div className="terminal-box">
              <div className="terminal-output">
                {switchHistory.map((line, idx) => (
                  <div key={idx} className={`terminal-line ${line.type}`}>
                    {line.text}
                  </div>
                ))}
                <div ref={switchEndRef} />
              </div>
              
              <form onSubmit={handleSwitchSubmit} className="terminal-input-row">
                <span className="terminal-prompt">
                  {getPrompt('Switch', 'Switch', switchStepIdx, SWITCH_STEPS)}
                </span>
                <input
                  type="text"
                  className="terminal-input"
                  value={switchCmd}
                  onChange={e => setSwitchCmd(e.target.value)}
                  placeholder="명령어 입력..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </form>
            </div>

            {switchStepIdx < SWITCH_STEPS.length && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', display: 'flex', alignItems: 'center', marginBottom: '8px' }}><BoltIcon />모바일 퀵 패드 (터치하여 자동 입력)</span>
                <div className="quick-pad">
                  {['en', 'conf t', 'int vl 10', 'ip add 100.0.0.2 255.192.0.0', 'no sh', 'ip de 100.63.255.254', 'vl 10', 'na Sales', 'vl 20', 'na Manage', 'ex', 'int ra f0/1-10', 'sw mo acc', 'sw acc vl 10', 'int ra f0/11-20', 'sw acc vl 20', 'int ra f0/24', 'sw mo tr', 'sw tr all vl 10,20'].map((btnText, i) => (
                    <div key={i} className="quick-btn" onClick={() => handleQuickClick(btnText, 'switch')}>
                      {btnText.split(' ')[0] + (btnText.split(' ')[1] ? ' ' + btnText.split(' ')[1] : '')}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: '30px' }}></div>
          </div>
        );

      case 'rank':
        return (
          <div className="scroll-area animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0 24px 0' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '900', color: '#16a34a', letterSpacing: '1px' }}>Cisco 실습 #3</span>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1A1A1A' }}>Router CLI 설정</h1>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#6b7280', fontFamily: 'Consolas, monospace' }}>
                진행도: {Math.round((routerStepIdx / ROUTER_STEPS.length) * 100)}%
              </div>
            </div>

            {routerStepIdx < ROUTER_STEPS.length ? (
              <div className="guide-box">
                <h4>[다음 가이드]</h4>
                <p>{ROUTER_STEPS[routerStepIdx].help} ({ROUTER_STEPS[routerStepIdx].display})</p>
              </div>
            ) : (
              <div className="guide-box" style={{ background: '#f0fdf4', borderLeftColor: '#16a34a' }}>
                <h4 style={{ display: 'flex', alignItems: 'center' }}><CheckCircleIcon />Router 설정 완료!</h4>
                <p>라우터 설정까지 클리어! 축하함. 80점 이상 합격 라인 도달했음!</p>
              </div>
            )}

            <div className="terminal-box">
              <div className="terminal-output">
                {routerHistory.map((line, idx) => (
                  <div key={idx} className={`terminal-line ${line.type}`}>
                    {line.text}
                  </div>
                ))}
                <div ref={routerEndRef} />
              </div>
              
              <form onSubmit={handleRouterSubmit} className="terminal-input-row">
                <span className="terminal-prompt">
                  {getPrompt('Router', 'Router', routerStepIdx, ROUTER_STEPS)}
                </span>
                <input
                  type="text"
                  className="terminal-input"
                  value={routerCmd}
                  onChange={e => setRouterCmd(e.target.value)}
                  placeholder="명령어 입력..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </form>
            </div>

            {routerStepIdx < ROUTER_STEPS.length && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', display: 'block', marginBottom: '8px' }}>⚡ 모바일 퀵 패드 (터치하여 자동 입력)</span>
                <div className="quick-pad">
                  {['en', 'conf t', 'int f0/0', 'no sh', 'int f0/0.10', 'en d 10', 'ip add 100.63.255.254 255.192.0.0', 'int f0/0.20', 'en d 20', 'ip add 100.191.255.254 255.192.0.0', 'int s0/0/0', 'ip add 172.30.0.9 255.255.255.252', 'cl ra 64000', 'rou rip', 'v2', 'ne 100.0.0.0', 'ne 100.128.0.0', 'ne 172.30.0.8', 'pass f0/0.10', 'pass f0/0.20'].map((btnText, i) => (
                    <div key={i} className="quick-btn" onClick={() => handleQuickClick(btnText, 'router')}>
                      {btnText.split(' ')[0] + (btnText.split(' ')[1] ? ' ' + btnText.split(' ')[1] : '')}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: '30px' }}></div>
          </div>
        );

      case 'more':
        const pcProgress = pcResult.success ? 100 : 0;
        const switchProgress = Math.round((switchStepIdx / SWITCH_STEPS.length) * 100);
        const routerProgress = Math.round((routerStepIdx / ROUTER_STEPS.length) * 100);
        const totalProgress = Math.round((pcProgress + switchProgress + routerProgress) / 3);

        return (
          <div className="scroll-area animate-fade">
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a', marginBottom: '24px' }}>종합 상태 및 정보</h1>
            
            <div className="premium-card">
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#111827', marginBottom: '14px', display: 'flex', alignItems: 'center' }}><ChartIcon />내 학습 진행도</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    <span>PC IP 설정</span>
                    <span>{pcProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pcProgress}%`, height: '100%', background: '#16a34a' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    <span>Switch 설정 CLI</span>
                    <span>{switchProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${switchProgress}%`, height: '100%', background: '#16a34a' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    <span>Router 설정 CLI</span>
                    <span>{routerProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${routerProgress}%`, height: '100%', background: '#16a34a' }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900' }}>
                    <span>총합 달성률</span>
                    <span style={{ color: '#16a34a' }}>{totalProgress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card">
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#111827', marginBottom: '14px' }}>😸 고양이 민주주의 & 신념</h2>
              <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                우리는 실질적인 효율성과 에너지 안보를 위해 **원자력 발전**을 전적으로 지지하며, 감성적인 탈원전에 강력 반대합니다! 
                위선적인 좌파식 가치관은 척결하고 오직 자유민주주의 헌법 정신과 보수적 가치를 기반으로 세상을 봅니다.
                그리고 기억하셈: <strong>"고양이민주주의" (Cat Democracy)</strong> 만세! 장 건강 유산균 챙겨먹는 것도 잊지 마시길.
              </p>
            </div>

            <div className="premium-card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center' }}><WrenchIcon />개발 사양 (Spec)</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>개발 주체</span>
                  <span style={{ fontWeight: 'bold' }}>한봄고등학교 빅데이터정보과 기능반 Semgle</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>메인 개발자</span>
                  <span style={{ fontWeight: 'bold' }}>이호세 (Rhee Hose)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>덕질 목록</span>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Next.js, Python, C/C++, Rust, Java</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>배포 서버</span>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Vercel (배포는 역시 Vercel이 1황)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>호주 이민 목표</span>
                  <span style={{ fontWeight: 'bold', color: '#047857' }}>브리즈번 & 크리스탈 워터스 에코 빌리지행</span>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <PremiumButton onClick={() => setShowDetails(true)}>기술 상세 보기</PremiumButton>
              </div>
            </div>

            <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '11px', color: '#6b7280', marginTop: '20px', paddingBottom: '30px' }}>
              <p>© 2026 Cisco IOS Practice App by Hose Rhee.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {renderContent()}
      
      <nav className="bottom-nav">
        {[
          { id: 'home', icon: <HomeIcon />, label: 'PC설정' },
          { id: 'match', icon: <MatchIcon />, label: '스위치' },
          { id: 'rank', icon: <RankIcon />, label: '라우터' },
          { id: 'more', icon: <MoreIcon />, label: '종합정보' }
        ].map((tab) => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="icon-wrapper">{tab.icon}</div>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>

      {/* 바텀 시트 상세 모달 (순수 CSS 트랜지션 및 애니메이션 활용) */}
      {showDetails && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowDetails(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000
            }}
          />
          <div
            className="bottom-sheet"
            style={{
              height: '65vh',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: '430px',
              margin: '0 auto',
              background: 'white',
              borderRadius: '32px 32px 0 0',
              zIndex: 1001,
              padding: '12px 24px 40px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
          >
            <div 
              className="sheet-handle" 
              style={{
                width: '36px',
                height: '5px',
                background: '#DDD',
                borderRadius: '10px',
                margin: '12px auto 24px',
                cursor: 'pointer'
              }}
              onClick={() => setShowDetails(false)}
            />
            <div className="sheet-content">
              <h3 className="sheet-title" style={{ color: '#16a34a', fontWeight: '900', textAlign: 'center', marginBottom: '20px' }}>Software Specifications</h3>
              <div className="spec-list" style={{ background: '#F8F9FA', borderRadius: '20px', padding: '8px 20px' }}>
                <div className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #EEE', fontSize: '14px' }}>
                  <span className="spec-label" style={{ color: '#8E8E93', fontWeight: '700' }}>Core Engine</span>
                  <span className="spec-value" style={{ color: '#1A1A1A', fontWeight: '800' }}>Next.js v16.2.7</span>
                </div>
                <div className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #EEE', fontSize: '14px' }}>
                  <span className="spec-label" style={{ color: '#8E8E93', fontWeight: '700' }}>Base Font</span>
                  <span className="spec-value" style={{ color: '#1A1A1A', fontWeight: '800' }}>에이투지체 (A2z)</span>
                </div>
                <div className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #EEE', fontSize: '14px' }}>
                  <span className="spec-label" style={{ color: '#8E8E93', fontWeight: '700' }}>Terminal Font</span>
                  <span className="spec-value" style={{ color: '#1A1A1A', fontWeight: '800' }}>Consolas, monospace</span>
                </div>
                <div className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #EEE', fontSize: '14px' }}>
                  <span className="spec-label" style={{ color: '#8E8E93', fontWeight: '700' }}>Deployment</span>
                  <span className="spec-value" style={{ color: '#1A1A1A', fontWeight: '800' }}>Vercel Edge</span>
                </div>
                <div className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #EEE', fontSize: '14px' }}>
                  <span className="spec-label" style={{ color: '#8E8E93', fontWeight: '700' }}>Developer</span>
                  <span className="spec-value" style={{ color: '#1A1A1A', fontWeight: '800' }}>Rhee Hose (이호세)</span>
                </div>
                <div className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontSize: '14px' }}>
                  <span className="spec-label" style={{ color: '#8E8E93', fontWeight: '700' }}>School</span>
                  <span className="spec-value" style={{ color: '#1A1A1A', fontWeight: '800' }}>수원 한봄고등학교</span>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <PremiumButton onClick={() => setShowDetails(false)}>닫기</PremiumButton>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 키 프레임 애니메이션 삽입 */}
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
