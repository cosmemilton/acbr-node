unit NativeParent;
{$mode objfpc}{$H+}
interface
procedure VigiarPai;
implementation
uses SysUtils,NativeProtocol
{$IFDEF UNIX},BaseUnix,Unix{$ENDIF}
{$IFDEF MSWINDOWS},Windows,Classes{$ENDIF};
{$IFDEF LINUX}
function prctl(option:LongInt;arg2:PtrUInt;arg3:PtrUInt;arg4:PtrUInt;arg5:PtrUInt):LongInt;cdecl;external 'c' name 'prctl';
{$ENDIF}
{$IFDEF MSWINDOWS}
type
 TProcessEntry=record
  dwSize,cntUsage,th32ProcessID:DWORD;
  th32DefaultHeapID:PtrUInt;
  th32ModuleID,cntThreads,th32ParentProcessID:DWORD;
  pcPriClassBase:LongInt;dwFlags:DWORD;
  szExeFile:array[0..MAX_PATH-1]of AnsiChar;
 end;
 TParentWatch=class(TThread)
 private H:THandle;
 protected procedure Execute;override;
 public constructor Create(AHandle:THandle);
end;
function CreateToolhelp32Snapshot(Flags,ProcessId:DWORD):THandle;stdcall;external 'kernel32.dll';
function Process32First(Snapshot:THandle;var Entry:TProcessEntry):BOOL;stdcall;external 'kernel32.dll' name 'Process32First';
function Process32Next(Snapshot:THandle;var Entry:TProcessEntry):BOOL;stdcall;external 'kernel32.dll' name 'Process32Next';
constructor TParentWatch.Create(AHandle:THandle);
begin H:=AHandle;FreeOnTerminate:=True;inherited Create(False);end;
procedure TParentWatch.Execute;
begin if WaitForSingleObject(H,INFINITE)=WAIT_OBJECT_0 then TerminateProcess(GetCurrentProcess,125);CloseHandle(H);end;
{$ENDIF}
procedure VigiarPai;
var P:LongWord;
{$IFDEF MSWINDOWS}H,Snapshot:THandle;Entry:TProcessEntry;ActualParent:DWORD;{$ENDIF}
begin
 if ParamCount=0 then Exit;
 if(ParamCount<>2)or(ParamStr(1)<>'--parent-pid')then Falhar('PROCESSO_PAI_INVALIDO','Inicialização inválida.');
 P:=StrToDWordDef(ParamStr(2),0);if P=0 then Falhar('PROCESSO_PAI_INVALIDO','Supervisor inválido.');
 {$IFDEF UNIX}
 if fpGetPPid<>P then Falhar('PROCESSO_PAI_INVALIDO','Supervisor divergente.');
 {$IFDEF LINUX}
 if prctl(1,SIGKILL,0,0,0)<>0 then Falhar('PROCESSO_PAI_INVALIDO','Não foi possível vigiar o supervisor.');
 if fpGetPPid<>P then Halt(125);
 {$ENDIF}
 {$ENDIF}
 {$IFDEF MSWINDOWS}
 H:=OpenProcess(SYNCHRONIZE,False,P);if H=0 then Falhar('PROCESSO_PAI_INVALIDO','Supervisor indisponível.');
 ActualParent:=0;Snapshot:=CreateToolhelp32Snapshot($00000002,0);
 if Snapshot<>INVALID_HANDLE_VALUE then try
  FillChar(Entry,SizeOf(Entry),0);Entry.dwSize:=SizeOf(Entry);
  if Process32First(Snapshot,Entry)then repeat
   if Entry.th32ProcessID=GetCurrentProcessId then begin ActualParent:=Entry.th32ParentProcessID;Break;end;
  until not Process32Next(Snapshot,Entry);
 finally CloseHandle(Snapshot);end;
 if ActualParent<>P then begin CloseHandle(H);Falhar('PROCESSO_PAI_INVALIDO','Supervisor divergente.');end;
 TParentWatch.Create(H);
 {$ENDIF}
end;
end.
