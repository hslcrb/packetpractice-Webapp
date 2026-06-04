'use client';

export default function PremiumButton({ children, onClick, style = {} }) {
    return (
        <button
            className="premium-action-btn"
            onClick={onClick}
            style={{
                ...style,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <span className="btn-text" style={{ position: 'relative', zIndex: 2 }}>{children}</span>

            {/* 영롱한 그린 메쉬 그라데이션 오버레이 (CSS hover로 자연스럽게 투명도 조절) */}
            <div
                className="mesh-gradient-overlay"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(at 0% 0%, rgba(22, 163, 74, 0.8) 0%, transparent 70%),
                        radial-gradient(at 100% 0%, rgba(52, 211, 153, 0.6) 0%, transparent 70%),
                        radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.4) 0%, transparent 70%),
                        radial-gradient(at 0% 100%, rgba(4, 120, 87, 0.6) 0%, transparent 70%)
                    `,
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'opacity 0.2s ease',
                }}
            />

            {/* 광택 효과 */}
            <div className="shine-layer" />

            <style jsx>{`
                .premium-action-btn {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.1s ease, box-shadow 0.2s ease;
                }
                .premium-action-btn:active {
                    transform: scale(0.98);
                }
                .premium-action-btn:hover .mesh-gradient-overlay {
                    opacity: 0.9;
                }
                .shine-layer {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    z-index: 2;
                    pointer-events: none;
                }
                .premium-action-btn:hover .shine-layer {
                    animation: fastShine 1.2s infinite linear;
                }
                @keyframes fastShine {
                    0% { left: -100%; }
                    100% { left: 150%; }
                }
            `}</style>
        </button>
    );
}
