unit NativeErrors;
{$mode objfpc}{$H+}
interface
uses SysUtils;
type EFiscal=class(Exception)
 public Codigo:string;constructor Create(const Code,MessageText:string);
end;
procedure Falhar(const Code,MessageText:string);
implementation
constructor EFiscal.Create(const Code,MessageText:string);
begin inherited Create(MessageText);Codigo:=Code;end;
procedure Falhar(const Code,MessageText:string);
begin raise EFiscal.Create(Code,MessageText);end;
end.
