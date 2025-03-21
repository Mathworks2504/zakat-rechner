import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ZakatRechner() {
  const [werte, setWerte] = useState({
    gold24: 0,
    gold22: 0,
    gold18: 0,
    goldSonstiges: 0,
    edelsteine: 0,
    silber: 0,
    barmittel: 0,
    sparkonto: 0,
    girokonto: 0,
    festgeld: 0,
    darlehen: 0,
    anleihen: 0,
    vorsorge: 0,
    versicherung: 0,
    aktien: 0,
    wertpapiere: 0,
    privateInvestitionen: 0,
    sonstigesKapital: 0,
    grundbesitz: 0,
    mieteinnahmen: 0,
    warenbestand: 0,
    beschaedigteWare: 0,
    zielkaeufe: 0,
    schuldenLieferanten: 0,
    uneinbringlich: 0,
    mitunternehmerKapital: 0,
    darlehenFirma: 0,
  });

  const [zakat, setZakat] = useState<number | null>(null);
  const [goldPreis, setGoldPreis] = useState<number | null>(null);
  const [silberPreis, setSilberPreis] = useState<number | null>(null);

  useEffect(() => {
    // Goldpreis abrufen
    fetch("https://metals.live/api/spot/gold")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGoldPreis(parseFloat(data[0][1]));
        }
      });

    // Silberpreis abrufen
    fetch("https://metals.live/api/spot/silver")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSilberPreis(parseFloat(data[0][1]));
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWerte({ ...werte, [name]: parseFloat(value) || 0 });
  };

  const berechneZakat = () => {
    if (!goldPreis || !silberPreis) return;

    const goldWert =
      werte.gold24 * goldPreis +
      werte.gold22 * goldPreis * 0.92 +
      werte.gold18 * goldPreis * 0.75 +
      werte.goldSonstiges;

    const silberWert = werte.silber * silberPreis;
    const edelsteinWert = werte.edelsteine;

    const barmittel = werte.barmittel + werte.sparkonto + werte.girokonto + werte.festgeld;
    const kapitalanlagen =
      werte.darlehen +
      werte.anleihen +
      werte.vorsorge +
      werte.versicherung +
      werte.aktien +
      werte.wertpapiere +
      werte.privateInvestitionen +
      werte.sonstigesKapital;

    const eigentum = werte.grundbesitz + werte.mieteinnahmen;

    const handelswaren =
      werte.warenbestand +
      werte.beschaedigteWare +
      werte.zielkaeufe -
      werte.schuldenLieferanten -
      werte.uneinbringlich;

    const unternehmensanteile = werte.mitunternehmerKapital + werte.darlehenFirma;

    const gesamt =
      goldWert +
      silberWert +
      edelsteinWert +
      barmittel +
      kapitalanlagen +
      eigentum +
      handelswaren +
      unternehmensanteile;

    const nisab = 85 * goldPreis; // Gold-basierter Nisab
    const zuVersteuernd = gesamt >= nisab ? gesamt : 0;
    const zakatBetrag = zuVersteuernd * 0.025;

    setZakat(zakatBetrag);
  };

  const kategorien = [
    ["Gold/Schmuck 24 Karat (g)", "gold24"],
    ["Gold/Schmuck 22 Karat (g)", "gold22"],
    ["Gold/Schmuck 18 Karat (g)", "gold18"],
    ["Andere Goldgegenstände (€)", "goldSonstiges"],
    ["Edelsteine (€)", "edelsteine"],
    ["Silber (g)", "silber"],
    ["Barmittel (€)", "barmittel"],
    ["Sparkonto (€)", "sparkonto"],
    ["Girokonto (€)", "girokonto"],
    ["Festgelder (€)", "festgeld"],
    ["Darlehen (€)", "darlehen"],
    ["Staatsanleihen (€)", "anleihen"],
    ["Vorsorgebeiträge (€)", "vorsorge"],
    ["Versicherungsprämien (€)", "versicherung"],
    ["Aktienwert (€)", "aktien"],
    ["Wertpapiere (€)", "wertpapiere"],
    ["Private Investitionen (€)", "privateInvestitionen"],
    ["Andere Kapitalquellen (€)", "sonstigesKapital"],
    ["Grundbesitz (geschätzt, €)", "grundbesitz"],
    ["Mieteinnahmen (€)", "mieteinnahmen"],
    ["Warenbestand (€)", "warenbestand"],
    ["Beschädigte Ware (€)", "beschaedigteWare"],
    ["Zielkäufe (€)", "zielkaeufe"],
    ["Lieferantenschulden (€)", "schuldenLieferanten"],
    ["Uneinbringliche Forderungen (€)", "uneinbringlich"],
    ["Kapitalanteile an Firma (€)", "mitunternehmerKapital"],
    ["Darlehen an Firma (€)", "darlehenFirma"],
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Zakat-Rechner</h1>
      <p className="text-center text-gray-600">
        Trage dein Vermögen ein – die App berechnet deine Zakat automatisch (2,5 % ab
        Nisab).
      </p>

      {goldPreis && (
        <p className="text-center text-sm text-green-700">
          Aktueller Goldpreis: {goldPreis.toFixed(2)} €/g – Nisab: {(goldPreis * 85).toFixed(2)} €
        </p>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          {kategorien.map(([label, name]) => (
            <div key={name}>
              <Label>{label}</Label>
              <Input
                type="number"
                name={name}
                value={werte[name as keyof typeof werte]}
                onChange={handleChange}
              />
            </div>
          ))}

          <Button className="w-full mt-4" onClick={berechneZakat}>
            Zakat berechnen
          </Button>

          {zakat !== null && (
            <div className="text-center mt-4">
              {zakat > 0 ? (
                <p>
                  Deine <strong>Zakat beträgt {zakat.toFixed(2)} €</strong>.
                </p>
              ) : (
                <p>Dein Vermögen liegt unter dem Nisab. Keine Zakat fällig.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
