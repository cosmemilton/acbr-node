// Synthetic signed XML, public X509 certificate only. Never transmit this document.
// Contains no PFX, private key or password. Generated offline by the test certificate fixture.
export const OFFLINE_DOCUMENT = {
  "infNFe": {
    "Versao": "4.00"
  },
  "Ide": {
    "cUF": 23,
    "cNF": 12345678,
    "natOp": "VENDA TESTE OFFLINE",
    "modelo": 55,
    "serie": 1,
    "nNF": 1,
    "dEmi": "2026-10-08T12:00:00",
    "tpNF": "tnSaida",
    "idDest": "doInterna",
    "cMunFG": 2304400,
    "tpImp": "tiRetrato",
    "tpEmis": "teNormal",
    "tpAmb": "taHomologacao",
    "finNFe": "fnNormal",
    "indFinal": "cfConsumidorFinal",
    "indPres": "pcPresencial",
    "procEmi": "peAplicativoContribuinte",
    "verProc": "ACBR-NODE-OFFLINE"
  },
  "Emit": {
    "CNPJCPF": "11222333000181",
    "xNome": "Café São José TESTE OFFLINE SEM VALOR FISCAL",
    "IE": "123456789",
    "CRT": "crtSimplesNacional",
    "EnderEmit": {
      "xLgr": "RUA TESTE",
      "nro": "1",
      "xBairro": "TESTE",
      "cMun": 2304400,
      "xMun": "FORTALEZA",
      "UF": "CE",
      "CEP": 60000000,
      "cPais": 1058,
      "xPais": "BRASIL"
    }
  },
  "Dest": {
    "CNPJCPF": "12345678909",
    "xNome": "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL",
    "indIEDest": "inNaoContribuinte",
    "EnderDest": {
      "xLgr": "RUA TESTE",
      "nro": "2",
      "xBairro": "TESTE",
      "cMun": 2304400,
      "xMun": "FORTALEZA",
      "UF": "CE",
      "CEP": 60000000,
      "cPais": 1058,
      "xPais": "BRASIL"
    }
  },
  "Det": [
    {
      "Prod": {
        "nItem": 1,
        "cProd": "TESTE",
        "cEAN": "SEM GTIN",
        "xProd": "Café São José PRODUTO SINTÉTICO OFFLINE",
        "NCM": "22021000",
        "CFOP": "5102",
        "uCom": "UN",
        "qCom": "1",
        "vUnCom": "10",
        "vProd": "10",
        "cEANTrib": "SEM GTIN",
        "uTrib": "UN",
        "qTrib": "1",
        "vUnTrib": "10",
        "IndTot": "itSomaTotalNFe"
      },
      "Imposto": {
        "ICMS": {
          "orig": "oeNacional",
          "CSOSN": "csosn102"
        },
        "PIS": {
          "CST": "pis07"
        },
        "COFINS": {
          "CST": "cof07"
        }
      }
    }
  ],
  "Total": {
    "ICMSTot": {
      "vProd": "10",
      "vNF": "10"
    }
  },
  "Transp": {
    "modFrete": "mfSemFrete"
  },
  "pag": [
    {
      "tPag": "fpDinheiro",
      "indPag": "ipVista",
      "vPag": "10"
    }
  ]
} as const;
export const OFFLINE_SIGNED_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\"><infNFe Id=\"NFe23261011222333000181550010000000011123456780\" versao=\"4.00\"><ide><cUF>23</cUF><cNF>12345678</cNF><natOp>VENDA TESTE OFFLINE</natOp><mod>55</mod><serie>1</serie><nNF>1</nNF><dhEmi>2026-10-08T12:00:00-03:00</dhEmi><tpNF>1</tpNF><idDest>1</idDest><cMunFG>2304400</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>0</cDV><tpAmb>2</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>ACBR-NODE-OFFLINE</verProc></ide><emit><CNPJ>11222333000181</CNPJ><xNome>Café São José TESTE OFFLINE SEM VALOR FISCAL</xNome><enderEmit><xLgr>RUA TESTE</xLgr><nro>1</nro><xBairro>TESTE</xBairro><cMun>2304400</cMun><xMun>FORTALEZA</xMun><UF>CE</UF><CEP>60000000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit><IE>123456789</IE><CRT>1</CRT></emit><dest><CPF>12345678909</CPF><xNome>NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL</xNome><enderDest><xLgr>RUA TESTE</xLgr><nro>2</nro><xBairro>TESTE</xBairro><cMun>2304400</cMun><xMun>FORTALEZA</xMun><UF>CE</UF><CEP>60000000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderDest><indIEDest>9</indIEDest></dest><det nItem=\"1\"><prod><cProd>TESTE</cProd><cEAN>SEM GTIN</cEAN><xProd>Café São José PRODUTO SINTÉTICO OFFLINE</xProd><NCM>22021000</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>1.0000</qCom><vUnCom>10.0000000000</vUnCom><vProd>10.00</vProd><cEANTrib>SEM GTIN</cEANTrib><uTrib>UN</uTrib><qTrib>1.0000</qTrib><vUnTrib>10.0000000000</vUnTrib><indTot>1</indTot></prod><imposto><ICMS><ICMSSN102><orig>0</orig><CSOSN>102</CSOSN></ICMSSN102></ICMS><PIS><PISNT><CST>07</CST></PISNT></PIS><COFINS><COFINSNT><CST>07</CST></COFINSNT></COFINS></imposto></det><total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet><vProd>10.00</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro><vNF>10.00</vNF></ICMSTot></total><transp><modFrete>9</modFrete></transp><pag><detPag><indPag>0</indPag><tPag>01</tPag><vPag>10.00</vPag></detPag></pag></infNFe><Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\"><SignedInfo><CanonicalizationMethod Algorithm=\"http://www.w3.org/TR/2001/REC-xml-c14n-20010315\"></CanonicalizationMethod><SignatureMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#rsa-sha1\"></SignatureMethod><Reference URI=\"#NFe23261011222333000181550010000000011123456780\"><Transforms><Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"></Transform><Transform Algorithm=\"http://www.w3.org/TR/2001/REC-xml-c14n-20010315\"></Transform></Transforms><DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\"></DigestMethod><DigestValue>Ya5kXhcEibOVfcyOI0BzqcYzyMM=</DigestValue></Reference></SignedInfo><SignatureValue>mirdDvdV+VId/zsstW/6lVFsSVxdyWkdkY1NPd2ynLHpjtolFoIhaBGlfxxs7IhU/AzcNQmR6ivr9YkH1HXaMAypvvx9M6GR/T4du/Zqab4gx3YInVybjJTeQ7BKEDnLhde2TUKoXrxmfrrmBUw6K4nTNufVjUjFJBfGcwhJ57T72x7ssdoYuPvZCphb0IR8WxHRKhvKAQhjW61qfh33csTabelgVZSLuTC2I2k9+a+ARd88CLTlfhYNCAPItOdUnAjgrhAhtiDi2FjXKjywgRqx0zay8DxF9Y2iyTJd3IAoWOERGdI9whgsuzWiZUr2I0I5QGGBELVabfjXm/Bneg==</SignatureValue><KeyInfo><X509Data><X509Certificate>MIIDhjCCAm6gAwIBAgIBATANBgkqhkiG9w0BAQsFADBbMSswKQYDVQQDEyJBQ0JSIE5PREUgU1lOVEhFVElDOjExMjIyMzMzMDAwMTgxMQswCQYDVQQGEwJCUjEfMB0GA1UEChMWU1lOVEhFVElDIE9GRkxJTkUgVEVTVDAeFw0yNjEwMDYyMjIzMzNaFw0yNzEwMDgyMjIzMzNaMFsxKzApBgNVBAMTIkFDQlIgTk9ERSBTWU5USEVUSUM6MTEyMjIzMzMwMDAxODExCzAJBgNVBAYTAkJSMR8wHQYDVQQKExZTWU5USEVUSUMgT0ZGTElORSBURVNUMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsOwRzuW4de7jrv1IkcNgT311292NR5NNIHt6Fncarm2iJX6mYsIjPWriFQmrU88p7bfRI3EsXJrlK0oGCuMafbNf1nBZ6Tu8aV1ixbAIgu9ZIbWoDqDNbYJBucQRuKsI1ytFbY7eI0juhcdAlBHw3TNdgSbuv/8kEGgTTJ803wBcC+emGZHdpb4Bwx6Db0Fio0lWLlBaep9+MFNZZiEYmDA3dwgZF14MAr5MpzcNDUVYh/g95Ks8x+mhErOPdtmL1A6cDg+xtjiApeMJZqjMrdsXP4yQ34h5VRy03ZUJkXVAquOfWhXpQL/qjoSzXfHvij2wB0pVn89FzVZh7GzStQIDAQABo1UwUzAJBgNVHRMEAjAAMAsGA1UdDwQEAwIF4DATBgNVHSUEDDAKBggrBgEFBQcDAjAkBgNVHREEHTAboBkGBWBMAQMDoBAMDjExMjIyMzMzMDAwMTgxMA0GCSqGSIb3DQEBCwUAA4IBAQBDhbpxphiuAUlQWXkcVt22Nc+g2UM6GCZyC3v9o21llLSCyK/nhkrRCQzM75/86kbnYZ1zdulC9N4XQFgATwm16Sf/nDZw8s5EsXqZ8mwbauDs/aQvWrbQnyawB7c+aXvlUDkcfNq+3hLQ5ep8/bmGh4eueiNoPD0fjf/jUVmrS6KyHb6/FyIZGP6fEYAO6XrqJPMSPxpJHnbPXZXKW2vcCh3qaG1vTSeN8PLfN2Q/mp1XUH8VqHgl3jzssx/zwb1NKuKEz9WL+6ilLc1ZfIqUakJyQNMqMz2KIjqGKGp7TtpNHZ7mz+kBX4Xw7D5fFVrXYb7DN6KylyKLmXoEzs1B</X509Certificate></X509Data></KeyInfo></Signature></NFe>";
