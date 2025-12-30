import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Participant, Winner, AppState } from "./types"
import {
  PRIZES,
  APP_STORAGE_KEY,
  DEFAULT_CONGRATS_MESSAGE,
  DEFAULT_PARTICIPANTS_TEST,
} from "./constants"
import confetti from "canvas-confetti"

// --- Cookie Helpers ---
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`
}

const getCookie = (name: string) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=")
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, "")
}

// --- Sub-components ---
const Button: React.FC<{
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger" | "ghost"
  className?: string
  size?: "sm" | "md"
}> = ({
  onClick,
  children,
  disabled,
  variant = "primary",
  className = "",
  size = "md",
}) => {
  const baseStyles =
    "rounded-full font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  const sizes = { sm: "px-6 py-2 text-[10px]", md: "px-10 py-4 text-sm" }
  const variants = {
    primary: "bg-[#1d58f4] hover:bg-[#3b6fff] text-white shadow-xl shadow-blue-500/20",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white shadow-lg",
    danger: "bg-red-900/40 hover:bg-red-700/60 text-red-200 border border-red-500/30",
    ghost: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  )
}

const NameRoller: React.FC<{ names: string[]; winnerName: string | null }> = ({
  names,
  winnerName,
}) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const spinList = useMemo(() => {
    const shuffled = [...names].sort(() => 0.5 - Math.random())
    const subset = shuffled.slice(0, 50)
    if (winnerName) subset[45] = winnerName
    return subset
  }, [winnerName, names])

  useEffect(() => {
    if (winnerName) {
      const timer = setTimeout(() => setIsSpinning(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsSpinning(false)
    }
  }, [winnerName])

  return (
    <div className='relative h-[250px] w-full overflow-hidden flex flex-col items-center bg-black/40 rounded-3xl border border-white/5 shadow-inner'>
      <div className='absolute top-1/2 left-0 w-full h-[70px] -translate-y-1/2 border-y border-blue-500/30 bg-blue-500/5 z-10 pointer-events-none'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10' />
      </div>
      <div className='absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none' />
      <div
        className='flex flex-col transition-transform duration-[2500ms] ease-[cubic-bezier(0.15,0,0.05,1)]'
        style={{
          transform: isSpinning
            ? `translateY(calc(-45 * 60px + 95px))`
            : "translateY(0px)",
        }}>
        {spinList.map((name, i) => (
          <div
            key={i}
            className='h-[60px] flex items-center justify-center text-xl md:text-2xl font-mono text-[#f1f1f1] opacity-80'>
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

const WinnerModal: React.FC<{ winner: Winner | null; onClose: () => void }> = ({
  winner,
  onClose,
}) => {
  if (!winner) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500'
        onClick={onClose}
      />
      <div className='relative w-full max-w-md bg-gradient-to-b from-white/[0.1] to-transparent border border-white/20 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-500'>
        <div className='absolute -top-6 bg-[#1d58f4] p-3 rounded-xl shadow-xl rotate-3'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
            />
          </svg>
        </div>
        <div className='text-[80px] mb-4 drop-shadow-[0_15px_30px_rgba(29,88,244,0.3)] animate-bounce'>
          {winner.prize.icon}
        </div>
        <h2 className='text-4xl font-black text-white mb-2 tracking-tighter leading-tight'>
          {winner.participant.name}
        </h2>
        <div className='mb-6'>
          <p className='text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold'>
            Та дараах шагналын эзэн боллоо
          </p>
          <div className='text-2xl font-bold text-[#4f83ff]'>{winner.prize.name}</div>
        </div>
        <p className='text-base italic text-gray-200 font-light max-w-sm mb-8'>
          "{winner.congratsMessage || DEFAULT_CONGRATS_MESSAGE}"
        </p>
        <Button onClick={onClose} variant='primary' size='sm'>
          Хаах
        </Button>
      </div>
    </div>
  )
}

export default function App() {
  const initialParticipants = useMemo(
    () => DEFAULT_PARTICIPANTS_TEST.map((name, i) => ({ id: `p-${i}`, name })),
    []
  )
  const [participants] = useState<Participant[]>(initialParticipants)
  const [winners, setWinners] = useState<Winner[]>([])
  const [appState, setAppState] = useState<AppState>(AppState.READY)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [lastWinner, setLastWinner] = useState<Winner | null>(null)
  const [currentDrawnName, setCurrentDrawnName] = useState<string | null>(null)

  useEffect(() => {
    const saved = getCookie(APP_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWinners(parsed.winners || [])
        if (parsed.winners?.length >= PRIZES.length) setAppState(AppState.FINISHED)
      } catch (e) {
        console.error("Cookie loading error:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (winners.length > 0) setCookie(APP_STORAGE_KEY, JSON.stringify({ winners }), 7)
  }, [winners])

  const remainingPrizes = useMemo(() => {
    const wonPrizeIds = winners.map((w) => w.prize.id)
    return PRIZES.filter((p) => !wonPrizeIds.includes(p.id)).sort((a, b) => b.id - a.id)
  }, [winners])

  const nextPrize = remainingPrizes[0]

  const triggerCelebration = (isBigWinner: boolean) => {
    const confettiColors = ["#1d58f4", "#ffffff", "#4f83ff"]
    if (isBigWinner) {
      const end = Date.now() + 4000
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: confettiColors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: confettiColors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    } else {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: confettiColors,
      })
    }
  }

  const drawWinner = useCallback(() => {
    // Check if we have a prize to give
    if (!nextPrize || participants.length === 0 || appState === AppState.DRAWING) return

    const eligible = participants.filter(
      (p) => !winners.find((w) => w.participant.id === p.id)
    )
    if (eligible.length === 0) return

    const winnerParticipant = eligible[Math.floor(Math.random() * eligible.length)]

    // CAPTURE CURRENT PRIZE info so it doesn't vanish mid-animation
    const prizeForThisDraw = nextPrize

    setAppState(AppState.DRAWING)
    setCurrentDrawnName(winnerParticipant.name)

    setTimeout(() => {
      const newWinner: Winner = {
        participant: winnerParticipant,
        prize: prizeForThisDraw,
        drawnAt: Date.now(),
        congratsMessage: DEFAULT_CONGRATS_MESSAGE,
      }

      setWinners((prev) => [...prev, newWinner])
      setLastWinner(newWinner)
      setShowWinnerModal(true)
      triggerCelebration(prizeForThisDraw.isBigWinner)

      // We wait until modal closes to set AppState.FINISHED
      setAppState(AppState.READY)
    }, 2800)
  }, [nextPrize, participants, winners, appState])

  const handleReset = () => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      setWinners([])
      setAppState(AppState.READY)
      setCookie(APP_STORAGE_KEY, "", -1)
    }
  }

  // Determine if we show the results screen
  // We check winners.length vs total prizes, AND make sure the modal isn't open
  const isAllFinished = winners.length >= PRIZES.length && !showWinnerModal

  return (
    <div className='h-screen relative flex flex-col items-center p-4 overflow-hidden text-white bg-[#0a0a0a]'>
      {showWinnerModal && (
        <WinnerModal
          winner={lastWinner}
          onClose={() => {
            setShowWinnerModal(false)
            setCurrentDrawnName(null)
            if (winners.length >= PRIZES.length) {
              setAppState(AppState.FINISHED)
            }
          }}
        />
      )}

      <div className='absolute inset-0 overflow-hidden pointer-events-none -z-10'>
        <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px]' />
      </div>

      <header className='text-center mb-4 mt-2 flex flex-col items-center'>
        <img
          src='/zuw logo main white.png'
          alt='logo'
          className='w-[140px] md:w-[160px] h-auto mb-2 object-contain'
        />
        <h1 className='text-3xl md:text-5xl font-black text-[#1d58f4] tracking-tighter uppercase'>
          Азтан тодруулах
        </h1>
      </header>

      <main className='w-full max-w-6xl flex-1 flex flex-col lg:flex-row gap-6 items-stretch overflow-hidden mb-4'>
        <div className='flex-[1.5] flex flex-col'>
          <div
            className={`relative flex-1 p-6 rounded-[2.5rem] border transition-all duration-700 backdrop-blur-md flex flex-col items-center justify-center text-center ${
              (nextPrize?.isBigWinner || lastWinner?.prize.isBigWinner) &&
              appState === AppState.DRAWING
                ? "border-blue-500/40 bg-white/[0.05]"
                : "border-white/10 bg-white/[0.03]"
            }`}>
            {!isAllFinished ? (
              <div className='w-full animate-in fade-in duration-700'>
                {/* Always show the icon of the NEXT prize, unless we just won the last one */}
                {nextPrize && (
                  <>
                    <div className='relative inline-block mb-2'>
                      <div className='text-6xl md:text-8xl mb-1 drop-shadow-[0_10px_30px_rgba(29,88,244,0.4)]'>
                        {nextPrize.icon}
                      </div>
                      {nextPrize.isBigWinner && (
                        <div className='absolute -top-2 -right-6 bg-[#1d58f4] text-[8px] px-2 py-1 rounded-full uppercase font-bold'>
                          Тусгай
                        </div>
                      )}
                    </div>
                    <div className='mb-4'>
                      <h3 className='text-gray-500 uppercase tracking-widest text-[9px] mb-1'>
                        Дараагийн шагнал
                      </h3>
                      <h2
                        className={`text-3xl md:text-5xl font-black ${
                          nextPrize.isBigWinner ? "text-[#1d58f4]" : "text-white"
                        }`}>
                        {nextPrize.name}
                      </h2>
                    </div>
                  </>
                )}

                <div className='w-full max-w-md mx-auto'>
                  {appState === AppState.DRAWING ? (
                    <NameRoller
                      names={participants.map((p) => p.name)}
                      winnerName={currentDrawnName}
                    />
                  ) : (
                    nextPrize && (
                      <Button onClick={drawWinner} variant='primary'>
                        Азтан тодруулах
                      </Button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className='animate-in zoom-in duration-500'>
                <div className='text-6xl mb-4'>🥂</div>
                <h2 className='text-4xl font-black text-[#1d58f4] mb-4'>
                  Арга хэмжээ дууслаа
                </h2>
                <Button variant='ghost' onClick={handleReset} size='sm'>
                  Дахин эхлүүлэх
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar remains same */}
        <aside className='flex-1 lg:max-w-[340px] flex flex-col overflow-hidden'>
          <div className='bg-white/[0.04] backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 flex flex-col h-full'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold flex items-center gap-2 text-sm'>
                <span className='p-1.5 bg-[#1d58f4] rounded-lg'>
                  <svg className='h-3 w-3' viewBox='0 0 20 20' fill='currentColor'>
                    <path d='M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z' />
                  </svg>
                </span>
                Азтанууд
              </h3>
              <span className='text-[10px] text-gray-500 font-bold'>
                {winners.length}/{PRIZES.length}
              </span>
            </div>
            <div className='flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2'>
              {winners.length === 0 ? (
                <div className='h-full flex flex-col items-center justify-center text-gray-600 text-[10px] uppercase tracking-tighter'>
                  Хүлээж байна...
                </div>
              ) : (
                [...winners].reverse().map((w, i) => (
                  <div
                    key={i}
                    className='bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-right duration-300'>
                    <div className='text-2xl'>{w.prize.icon}</div>
                    <div className='min-w-0'>
                      <div className='font-bold text-sm truncate'>
                        {w.participant.name}
                      </div>
                      <div
                        className={`text-[9px] font-black uppercase ${
                          w.prize.isBigWinner ? "text-blue-400" : "text-gray-500"
                        }`}>
                        {w.prize.name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      <footer className='py-2 opacity-30'>
        <p className='text-[8px] tracking-[0.5em] uppercase font-bold'>
          Зөв хуримтлалын сан &bull; 2025
        </p>
      </footer>
    </div>
  )
}
