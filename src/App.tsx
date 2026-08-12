import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, FileSignature, Cloud, X, Delete } from 'lucide-react';

const Header = ({ title, onBack }: { title: string, onBack?: () => void }) => (
  <div className="flex items-center justify-between px-4 py-3.5 bg-white shrink-0 relative">
    <button onClick={onBack} className="p-1 -ml-1 z-10">
      <ChevronLeft className="w-6 h-6 text-gray-900" />
    </button>
    <span className="absolute inset-0 flex items-center justify-center text-gray-900 text-[17px] font-medium pointer-events-none">
      {title}
    </span>
    <div className="w-8 z-10"></div>
  </div>
);

function Step0({ userInfo, setUserInfo, onNext }: any) {
  const isValid = userInfo.name.trim() !== '' && userInfo.idCard.trim() !== '';
  return (
    <div className="flex flex-col h-full bg-[#f4f5f7]">
      <Header title="信息确认" onBack={() => {}} />
      <div className="bg-white mt-2">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="text-gray-900 text-[16px]">姓名</span>
          <input 
            type="text" 
            placeholder="请输入真实姓名" 
            className="text-right text-gray-900 outline-none placeholder-gray-400 text-[16px] flex-1 ml-4"
            value={userInfo.name}
            onChange={e => setUserInfo({...userInfo, name: e.target.value})}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-gray-900 text-[16px]">身份证号</span>
          <input 
            type="text" 
            placeholder="请输入身份证号" 
            className="text-right text-gray-900 outline-none placeholder-gray-400 text-[16px] flex-1 ml-4"
            value={userInfo.idCard}
            onChange={e => setUserInfo({...userInfo, idCard: e.target.value})}
          />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="bg-white px-4 py-3 pb-8">
        <button 
          className={`w-full rounded-full py-3.5 text-[16px] font-medium transition-colors ${isValid ? 'bg-[#165dff] text-white' : 'bg-[#165dff]/50 text-white'}`}
          onClick={isValid ? onNext : undefined}
          disabled={!isValid}
        >
          下一步
        </button>
      </div>
    </div>
  );
}

function Step1({ signatureUrl, onNext, onPay, onBack }: any) {
  return (
    <div className="flex flex-col h-full bg-[#f4f5f7]">
      <Header title="专家云签" onBack={onBack} />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {signatureUrl ? (
          <div className="p-4">
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
              <div className="h-20 w-[140px] flex items-center justify-center overflow-hidden mr-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                <div className="absolute top-1.5 left-2.5 text-[11px] text-gray-400 font-medium tracking-widest">签名</div>
                <img src={signatureUrl} alt="Signature" className="max-w-full h-12 object-contain mix-blend-multiply mt-3 px-2" />
              </div>
              <button 
                onClick={onPay}
                className="flex items-center text-[#165dff] text-[15px] font-medium shrink-0 active:opacity-70 transition-opacity"
              >
                去支付
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-32 h-32 mb-8 relative flex items-center justify-center bg-blue-50 rounded-full shadow-sm border border-blue-100/50">
              <FileSignature className="w-14 h-14 text-blue-500" />
              <Cloud className="w-8 h-8 text-blue-300 absolute -top-1 -left-2" />
              <Cloud className="w-6 h-6 text-blue-300 absolute bottom-2 -right-2" />
            </div>
            <p className="text-gray-500 text-center text-[15px] leading-relaxed">
              暂无签名，请点击下方按钮<br/>进行专家签名采集
            </p>
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-3 pb-8 shrink-0">
        <button 
          className="w-full bg-[#165dff] text-white rounded-full py-3.5 text-[16px] font-medium"
          onClick={onNext}
        >
          {signatureUrl ? '重新录入' : '签名采集'}
        </button>
      </div>
    </div>
  );
}

function Step2({ paths, setPaths, onSave, onBack }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [currentPath, setCurrentPath] = useState<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const drawPath = (path: any) => {
      if (!path || path.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.lineWidth;
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    };
    
    paths.forEach(drawPath);
    if (currentPath) drawPath(currentPath);
  }, [paths, currentPath]);

  const startDrawing = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath({
      color,
      lineWidth,
      points: [{ x, y }]
    });
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !currentPath) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath((prev: any) => ({
      ...prev,
      points: [...prev.points, { x, y }]
    }));
  };

  const stopDrawing = () => {
    if (currentPath) {
      setPaths([...paths, currentPath]);
      setCurrentPath(null);
    }
    setIsDrawing(false);
  };

  const undo = () => setPaths((prev: any) => prev.slice(0, -1));
  const clear = () => setPaths([]);
  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a new canvas to rotate the image
    const rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = canvas.height;
    rotatedCanvas.height = canvas.width;
    const ctx = rotatedCanvas.getContext('2d');
    if (ctx) {
      ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      onSave(rotatedCanvas.toDataURL('image/png'));
    } else {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Header title="手写签名" onBack={onBack} />
      <div className="flex-1 flex overflow-hidden relative">
        <div ref={containerRef} className="flex-1 relative bg-white touch-none">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none w-full h-full cursor-crosshair"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerOut={stopDrawing}
          />
        </div>
        
        <div className="w-16 bg-white border-l border-gray-100 shadow-sm flex flex-col items-center py-4 gap-7 z-10 shrink-0">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] text-gray-500 font-medium -rotate-90 whitespace-nowrap tracking-[0.2em] w-4 inline-block text-center">画笔</span>
            <div className="h-28 w-4 relative flex justify-center">
              <input 
                type="range" 
                min="1" max="10" 
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="absolute top-1/2 left-1/2 rounded-full outline-none"
                style={{ 
                  width: '112px', 
                  height: '4px', 
                  transform: 'translate(-50%, -50%) rotate(-90deg)',
                  accentColor: '#2563eb'
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] text-gray-500 font-medium -rotate-90 whitespace-nowrap tracking-[0.2em] w-4 inline-block text-center">颜色</span>
            <button onClick={() => setColor('#000000')} className={`w-5 h-5 rounded-full bg-black shadow-sm transition-all ${color === '#000000' ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`} />
            <button onClick={() => setColor('#2563eb')} className={`w-5 h-5 rounded-full bg-blue-600 shadow-sm transition-all ${color === '#2563eb' ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`} />
            <button onClick={() => setColor('#dc2626')} className={`w-5 h-5 rounded-full bg-red-600 shadow-sm transition-all ${color === '#dc2626' ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`} />
          </div>

          <div className="flex-1"></div>

          <button onClick={undo} className="flex flex-col items-center gap-4 group">
            <span className="text-[11px] text-gray-500 font-medium group-hover:text-gray-900 transition-colors -rotate-90 whitespace-nowrap tracking-[0.2em] w-4 inline-block text-center">撤销</span>
            <RotateCcw className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors -rotate-90" />
          </button>
          
          <button onClick={clear} className="flex flex-col items-center gap-4 group mt-2">
            <span className="text-[11px] text-gray-500 font-medium group-hover:text-gray-900 transition-colors -rotate-90 whitespace-nowrap tracking-[0.2em] w-4 inline-block text-center">重写</span>
            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors -rotate-90" />
          </button>
          
          <button 
            onClick={save} 
            className="mt-4 bg-blue-600 text-white rounded-full w-9 h-24 flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-95 transition-transform"
          >
            <span className="-rotate-90 whitespace-nowrap text-[13px] font-medium tracking-[0.3em]">下一步</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3({ onBack, onComplete }: any) {
  const [paymentType, setPaymentType] = useState('single');

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7]">
      <Header title="支付" onBack={onBack} />
      <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">选择支付方式</h2>
        
        <div 
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentType === 'single' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          onClick={() => setPaymentType('single')}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[17px] font-semibold text-gray-900">单次项目</h3>
            <div className="text-2xl font-bold text-blue-600">¥10</div>
          </div>
          <p className="text-[14px] text-gray-500">单次签名录入与确认，适用于临时需求。</p>
        </div>
        
        <div 
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${paymentType === 'annual' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          onClick={() => setPaymentType('annual')}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[17px] font-semibold text-gray-900">包年会员</h3>
            <div className="text-2xl font-bold text-blue-600">¥200</div>
          </div>
          <p className="text-[14px] text-gray-500">一年内不限次数使用所有云签服务，超值选择。</p>
        </div>
      </div>
      
      <div className="bg-white p-5 pb-8 shadow-[0_-2px_15px_rgba(0,0,0,0.03)] border-t border-gray-100">
        <div className="flex justify-between items-end mb-5">
          <span className="text-gray-600 text-[15px]">合计金额：</span>
          <div className="flex items-baseline text-red-500">
            <span className="text-lg font-bold">¥</span>
            <span className="text-3xl font-bold ml-1">{paymentType === 'single' ? '10' : '200'}</span>
          </div>
        </div>
        <button 
          className="w-full bg-blue-600 text-white rounded-full py-3.5 text-[17px] font-medium shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-transform"
          onClick={() => {
            alert('支付成功！');
            onComplete(paymentType);
          }}
        >
          确认支付
        </button>
      </div>
    </div>
  );
}

function PinModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInput = (num: string) => {
    if (errorMsg) setErrorMsg('');
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => {
          if (step === 1) {
            setFirstPin(newPin);
            setPin('');
            setStep(2);
          } else {
            if (newPin === firstPin) {
              onSuccess();
            } else {
              setErrorMsg('两次密码不一致，请重新输入');
              setPin('');
              setFirstPin('');
              setStep(1);
            }
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex flex-col justify-end z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        <div className="relative py-4 flex items-center justify-center border-b border-gray-100">
          <button onClick={onClose} className="absolute left-4 p-1">
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-[17px] font-semibold text-gray-900">{step === 1 ? '设置证书密码' : '确认证书密码'}</h2>
        </div>
        
        <div className="flex flex-col items-center py-8">
          <div className="flex gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center ${errorMsg ? 'border border-red-500 bg-red-50' : ''}`}>
                {pin.length > i && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
              </div>
            ))}
          </div>
          <p className={`text-[13px] ${errorMsg ? 'text-red-500' : 'text-gray-500'}`}>
            {errorMsg ? errorMsg : (step === 1 ? '请输入证书密码' : '请再次确认证书密码')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-[1px] bg-gray-200 border-t border-gray-200 p-[1px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => handleInput(num.toString())} className="bg-white py-4 text-xl font-medium active:bg-gray-100 transition-colors">
              {num}
            </button>
          ))}
          <div className="bg-gray-50 py-4" />
          <button onClick={() => handleInput('0')} className="bg-white py-4 text-xl font-medium active:bg-gray-100 transition-colors">
            0
          </button>
          <button onClick={handleDelete} className="bg-gray-50 py-4 flex items-center justify-center active:bg-gray-200 transition-colors">
            <Delete className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepPreview({ signatureUrl, hasSetPin, setHasSetPin, onConfirm, onRetake, onBack }: any) {
  const [showPinModal, setShowPinModal] = useState(false);

  const handleConfirmClick = () => {
    if (hasSetPin) {
      onConfirm();
    } else {
      setShowPinModal(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <Header title="效果预览" onBack={onBack} />
      <div className="flex-1 flex items-start justify-center pt-12 overflow-y-auto">
        <div className="w-full bg-[#f5f5f5] flex items-center justify-center py-10">
           <div className="bg-white shadow-sm flex items-center justify-center w-[220px] h-[220px] p-2">
             <img src={signatureUrl} alt="Signature Preview" className="max-w-full max-h-full object-contain mix-blend-multiply" />
           </div>
        </div>
      </div>
      <div className="bg-white px-4 py-4 pb-8 shrink-0 flex flex-col gap-4">
        <button 
          className="w-full bg-[#165dff] text-white rounded-full py-3.5 text-[16px] font-medium"
          onClick={handleConfirmClick}
        >
          确认采集
        </button>
        <button 
          className="w-full bg-white text-gray-700 border border-gray-300 rounded-full py-3.5 text-[16px] font-medium"
          onClick={onRetake}
        >
          重新采集
        </button>
      </div>

      {showPinModal && (
        <PinModal 
          onClose={() => setShowPinModal(false)} 
          onSuccess={() => {
            setShowPinModal(false);
            setHasSetPin(true);
            onConfirm();
          }} 
        />
      )}
    </div>
  );
}

function StepDetails({ userInfo, signatureUrl, paymentInfo, onBack, onRetake, onResetPassword, onPay }: any) {
  const maskIdCard = (id: string) => {
    if (!id || id.length < 15) return id;
    return id.replace(/^(.{6})(?:\d+)(.{4})$/, "$1********$2");
  };

  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7]">
      <Header title="专家云签" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 text-[14px] text-gray-700 flex items-center gap-2 mt-2 bg-[#f4f5f7]">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <FileSignature className="w-3 h-3" />
          </div>
          我的云签
        </div>
        
        <div className="bg-white">
          <div className="p-4">
            <div className="w-full bg-[#f5f5f5] flex items-center justify-center py-6">
               <div className="bg-white shadow-sm flex items-center justify-center w-[200px] h-[200px] p-2">
                 <img src={signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain mix-blend-multiply" />
               </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 mt-2 text-[14px] text-gray-700 flex items-center gap-2 bg-[#f4f5f7]">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <FileSignature className="w-3 h-3" />
          </div>
          云签信息
        </div>

        <div className="bg-white">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-600 text-[15px]">姓名</span>
            <span className="text-gray-900 text-[15px]">{userInfo.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-600 text-[15px]">身份证号</span>
            <span className="text-gray-900 text-[15px]">{maskIdCard(userInfo.idCard)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-600 text-[15px]">采集时间</span>
            <span className="text-gray-900 text-[15px]">{currentTime}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-600 text-[15px]">有效期</span>
            <span className={paymentInfo?.status === 'paid' ? "text-gray-900 text-[15px]" : "text-red-500 text-[15px]"}>{paymentInfo?.status === 'paid' ? paymentInfo.date : '待支付'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4 active:bg-gray-50 transition-colors cursor-pointer" onClick={onResetPassword}>
            <span className="text-gray-600 text-[15px]">重置密码</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-4 pb-8 shrink-0">
        <button 
          className="w-full bg-[#165dff] text-white rounded-full py-3.5 text-[16px] font-medium shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-transform"
          onClick={onPay}
        >
          去支付
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(0); 
  const [userInfo, setUserInfo] = useState({ name: '张三', idCard: '11010519900101234X' });
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [paths, setPaths] = useState<any[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<{ status: 'unpaid' | 'paid', type?: string, date?: string }>({ status: 'unpaid' });
  const [hasSetPin, setHasSetPin] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:w-[375px] sm:h-[812px] h-screen bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative sm:border-[8px] border-gray-800">
        {currentStep === 0 && (
          <Step0 
            userInfo={userInfo} 
            setUserInfo={setUserInfo} 
            onNext={() => setCurrentStep(1)} 
          />
        )}
        {currentStep === 1 && (
          <Step1 
            signatureUrl={signatureUrl} 
            onNext={() => setCurrentStep(2)} 
            onPay={() => setCurrentStep(5)} 
            onBack={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <Step2 
            paths={paths} 
            setPaths={setPaths} 
            onSave={(url: string) => { 
              setSignatureUrl(url); 
              setCurrentStep(4); 
            }} 
            onBack={() => setCurrentStep(1)} 
          />
        )}
        {currentStep === 4 && (
          <StepPreview 
            signatureUrl={signatureUrl}
            hasSetPin={hasSetPin}
            setHasSetPin={setHasSetPin}
            onConfirm={() => setCurrentStep(1)}
            onRetake={() => {
              setPaths([]);
              setCurrentStep(2);
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <Step3 
            onBack={() => setCurrentStep(1)} 
            onComplete={(type: string) => {
              setPaymentInfo(prev => {
                const now = new Date();
                
                if (type === 'annual') {
                  let startDate = now;
                  let endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                  
                  if (prev.status === 'paid' && prev.type === 'annual' && prev.date) {
                    const parts = prev.date.split(' 至 ');
                    if (parts.length === 2) {
                      startDate = new Date(parts[0]);
                      const prevEnd = new Date(parts[1]);
                      if (prevEnd > now) {
                        endDate = new Date(prevEnd.getFullYear() + 1, prevEnd.getMonth(), prevEnd.getDate());
                      }
                    }
                  }
                  
                  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                  
                  return {
                    status: 'paid',
                    type,
                    date: `${formatDate(startDate)} 至 ${formatDate(endDate)}`
                  };
                } else {
                  if (prev.status === 'paid' && prev.type === 'annual') {
                    return prev;
                  }
                  let count = 1;
                  if (prev.status === 'paid' && prev.type === 'per_use' && prev.date && prev.date.endsWith('次')) {
                    count = parseInt(prev.date) + 1;
                    if (isNaN(count)) count = 1;
                  }
                  return {
                    status: 'paid',
                    type: 'per_use',
                    date: `${count}次`
                  };
                }
              });
              setCurrentStep(5);
            }} 
          />
        )}
        {currentStep === 5 && (
          <StepDetails 
            userInfo={userInfo}
            signatureUrl={signatureUrl}
            paymentInfo={paymentInfo}
            onRetake={() => {
              setPaths([]);
              setCurrentStep(2);
            }}
            onBack={() => setCurrentStep(1)}
            onResetPassword={() => {}}
            onPay={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  );
}
