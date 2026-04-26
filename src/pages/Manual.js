import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent2)', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' }}>{title}</h2>
    {children}
  </div>
)

const Sub = ({ title, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <h3 style={{ fontFamily: 'var(--head)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>{title}</h3>
    {children}
  </div>
)

const P = ({ children }) => (
  <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.5rem' }}>{children}</p>
)

const Ul = ({ items }) => (
  <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.2rem' }}>{item}</li>
    ))}
  </ul>
)

const Ol = ({ items }) => (
  <ol style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.2rem' }}>{item}</li>
    ))}
  </ol>
)

const FieldTable = ({ rows }) => (
  <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
      <thead>
        <tr style={{ background: 'var(--accent)', }}>
          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#fff', fontFamily: 'var(--head)', fontSize: '0.78rem', width: '35%' }}>Pole</th>
          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#fff', fontFamily: 'var(--head)', fontSize: '0.78rem' }}>Opis</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, desc], i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg3)' : 'var(--bg2)' }}>
            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--accent2)', verticalAlign: 'top' }}>{label}</td>
            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default function Manual() {
  const navigate = useNavigate()

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* Nagłówek */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '2rem', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            Jump<span style={{ color: 'var(--accent2)' }}>Log</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>by SkyQba ver 1.0</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Instrukcja użytkownika</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Elektroniczny Dziennik Skoków Spadochronowych</div>
        </div>

        {/* Spis treści */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Spis treści</div>
          {[
            '1. Czym jest JumpLog?',
            '2. Pierwsze kroki — rejestracja i logowanie',
            '3. Dziennik skoków',
            '4. Dodawanie nowego skoku',
            '5. Edycja zapisanych skoków',
            '6. Profil użytkownika',
            '7. Eksport skoków do PDF i druku',
            '8. Import skoków z pliku',
            '9. Bezpieczeństwo i prywatność',
            '10. Przydatne wskazówki',
          ].map((item, i) => (
            <div key={i} style={{ fontSize: '0.85rem', color: 'var(--accent2)', padding: '0.25rem 0', borderBottom: i < 9 ? '1px solid var(--border)' : 'none' }}>{item}</div>
          ))}
        </div>

        {/* 1 */}
        <Section title="1. Czym jest JumpLog?">
          <P>JumpLog to nowoczesna aplikacja webowa stworzona dla skoczków spadochronowych. Umożliwia prowadzenie elektronicznego dziennika skoków, przechowywanie skanów dokumentów, zarządzanie sprzętem i eksport danych do PDF.</P>
          <P>Aplikacja działa w przeglądarce internetowej na każdym urządzeniu — komputerze, telefonie i tablecie. Dane są przechowywane w chmurze i dostępne z dowolnego miejsca na świecie.</P>
        </Section>

        {/* 2 */}
        <Section title="2. Pierwsze kroki">
          <Sub title="2.1 Rejestracja">
            <P>Aby korzystać z JumpLog, musisz założyć bezpłatne konto:</P>
            <Ol items={[
              'Wejdź na adres aplikacji w przeglądarce',
              'Kliknij "Nie masz konta? Zarejestruj się"',
              'Wpisz imię, nazwisko, adres e-mail i hasło',
              'Opcjonalnie dodaj zdjęcie profilowe',
              'Kliknij "Zarejestruj się"',
            ]} />
          </Sub>
          <Sub title="2.2 Logowanie">
            <Ol items={[
              'Wpisz swój adres e-mail',
              'Wpisz hasło',
              'Kliknij "Zaloguj się"',
            ]} />
            <P><strong style={{ color: 'var(--text)' }}>Zapomniałeś hasła?</strong> Kliknij "Zapomniałeś hasła?" i wpisz swój e-mail. Otrzymasz link do resetowania hasła.</P>
          </Sub>
        </Section>

        {/* 3 */}
        <Section title="3. Dziennik skoków">
          <P>Dziennik to główna strona aplikacji. Widoczna jest tu lista wszystkich Twoich skoków posortowanych od najwyższego numeru.</P>
          <Sub title="3.1 Licznik skoków">
            <P>Na górze strony baner pokazuje Twój najwyższy numer skoku — odpowiadający łącznej liczbie wykonanych skoków.</P>
          </Sub>
          <Sub title="3.2 Wyszukiwanie">
            <P>Pod banerem znajduje się pole wyszukiwania. Możesz szukać po:</P>
            <Ul items={['Numerze skoku (np. "4235")', 'Dacie (np. "2024" lub "2024-06")', 'Miejscowości (np. "Gliwice")', 'Samolocie (np. "Cessna")', 'Spadochronie (np. "Para Foil")', 'Rodzaju skoku (np. "AFF")', 'Uwagach i wyniku']} />
            <P>Kliknij "✕" aby wyczyścić wyszukiwanie.</P>
          </Sub>
        </Section>

        {/* 4 */}
        <Section title="4. Dodawanie nowego skoku">
          <P>Kliknij przycisk "+ Dodaj skok" na stronie głównej. Formularz zawiera następujące pola:</P>
          <FieldTable rows={[
            ['Numer skoku', 'Wypełnia się automatycznie jako kolejny numer. Możesz go zmienić ręcznie.'],
            ['Data skoku', 'Wybierz datę z kalendarza'],
            ['Miejscowość', 'Wybierz ze swojej listy stref zrzutu lub wpisz ręcznie'],
            ['Spadochron', 'Wybierz ze swojej listy sprzętu lub wpisz ręcznie'],
            ['Rodzaj skoku', 'Tandem, AFF, SL, RW, FF, WS, CP, CF, ACC, B.A.S.E, Inny'],
            ['Wysokość (m)', 'Wysokość skoku w metrach'],
            ['Opóźnienie (s)', 'Czas opóźnienia otwarcia w sekundach'],
            ['Samolot', 'Typ samolotu lub śmigłowca'],
            ['Wynik', 'Np. "0.05", "1 miejsce", "zaliczony"'],
            ['Uwagi', 'Dodatkowe notatki'],
          ]} />
          <P>Po wypełnieniu pól kliknij "Zapisz skok".</P>
        </Section>

        {/* 5 */}
        <Section title="5. Edycja zapisanych skoków">
          <P>Wejdź do Profilu i kliknij "✏ Edytuj skoki". Możesz:</P>
          <Ul items={[
            'Wyszukać skok po numerze, miejscowości, samolocie lub dacie',
            'Kliknąć na skok lub przycisk "✏ Edytuj" aby rozwinąć formularz',
            'Zmienić dowolne pole',
            'Zapisać zmiany przyciskiem "✓ Zapisz zmiany"',
            'Anulować edycję przyciskiem "Anuluj"',
          ]} />
        </Section>

        {/* 6 */}
        <Section title="6. Profil użytkownika">
          <P>W profilu zarządzasz swoimi danymi, dokumentami i sprzętem. Kliknij ikonę osoby w prawym górnym rogu.</P>
          <Sub title="6.1 Dokumenty spadochronowe">
            <P>Przechowuj skany dokumentów w aplikacji. Dokumenty są prywatne i dostępne tylko dla Ciebie. Obsługiwane formaty: PDF, JPG, PNG.</P>
            <P>Zalecane dokumenty:</P>
            <Ul items={['Licencja skoczka', 'Polisa ubezpieczeniowa', 'Orzeczenie lotniczo-lekarskie', 'Świadectwo ułożenia spadochronu zapasowego']} />
          </Sub>
          <Sub title="6.2 Dane osobowe">
            <P>Uzupełnij imię, nazwisko i miejscowość zamieszkania.</P>
          </Sub>
          <Sub title="6.3 Licencja, ubezpieczenie, badania">
            <P>Wpisz numery i daty ważności. Aplikacja wyświetli ostrzeżenie gdy termin będzie się zbliżał.</P>
          </Sub>
          <Sub title="6.4 Spadochron zapasowy">
            <P>Wpisz nazwę, datę ułożenia i datę ważności. Aplikacja ostrzeże Cię gdy termin będzie bliski.</P>
          </Sub>
          <Sub title="6.5 Sprzęt i strefy zrzutu">
            <P>Dodaj swoje spadochrony i ulubione strefy zrzutu — będą dostępne jako lista przy dodawaniu skoku.</P>
          </Sub>
        </Section>

        {/* 7 */}
        <Section title="7. Eksport skoków">
          <P>Wejdź do Profilu i kliknij "↓ Eksportuj skoki (PDF / Druk)".</P>
          <Ul items={[
            'Zaznacz wybrane skoki lub kliknij "Zaznacz wszystkie"',
            '"📄 Pobierz PDF" — zapisuje plik PDF na urządzeniu (format A4 poziomy)',
            '"🖨 Drukuj" — otwiera okno drukowania przeglądarki',
          ]} />
        </Section>

        {/* 8 */}
        <Section title="8. Import skoków z pliku">
          <P>Wejdź do Profilu i kliknij "↑ Importuj skoki z CSV".</P>
          <Sub title="8.1 Przygotowanie pliku">
            <Ul items={[
              'Excel: Plik → Zapisz jako → Tekst (rozdzielany tabulatorami) (*.txt)',
              'Numbers: Plik → Eksportuj do → CSV',
            ]} />
          </Sub>
          <Sub title="8.2 Przebieg importu">
            <Ol items={[
              'Kliknij lub przeciągnij plik na pole importu',
              'Sprawdź podgląd pierwszych 8 skoków',
              'Kliknij "Importuj wszystkie X skoków"',
              'Poczekaj na zakończenie',
            ]} />
          </Sub>
        </Section>

        {/* 9 */}
        <Section title="9. Bezpieczeństwo i prywatność">
          <Ul items={[
            'Wszystkie dane są szyfrowane i przechowywane w chmurze',
            'Dokumenty są prywatne — dostępne tylko po zalogowaniu na Twoje konto',
            'Hasło jest szyfrowane i nieznane nikomu',
            'Możesz zresetować hasło w każdej chwili przez e-mail',
            'Dane innych użytkowników są dla Ciebie niedostępne',
          ]} />
        </Section>

        {/* 10 */}
        <Section title="10. Przydatne wskazówki">
          <Ul items={[
            'Dodaj JumpLog do Docku lub ekranu głównego telefonu aby mieć szybki dostęp',
            'Uzupełnij profil przed pierwszym skokiem — strefy zrzutu i sprzęt przyspieszą dodawanie skoków',
            'Skanuj dokumenty na bieżąco i przechowuj je w aplikacji jako backup',
            'Użyj wyszukiwarki aby szybko znaleźć skoki z konkretnej strefy lub na określonym samolocie',
            'Eksportuj PDF co sezon jako kopię zapasową dziennika',
          ]} />
        </Section>

        {/* Stopka */}
        <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.25rem' }}>JumpLog by SkyQba</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Elektroniczny Dziennik Skoków Spadochronowych · ver 1.0</div>
        </div>

      </div>
    </div>
  )
}
