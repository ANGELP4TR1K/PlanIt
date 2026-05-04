-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Máj 04. 23:47
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `planit`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `title` varchar(50) NOT NULL,
  `date` datetime NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `events`
--

INSERT INTO `events` (`id`, `type`, `description`, `category`, `title`, `date`, `location_id`, `link`, `is_private`, `created_by`, `capacity`) VALUES
(1, 'official', 'Puskás Aréna, Budapest', 'Koncert', 'Metallica in Budapest | M72 World Tour', '2026-06-11 12:00:00', 1, 'https://www.ticketswap.hu/concert-tickets/metallica-budapest-puskas-arena-2026-06-11-UphvxsqQuNKUK8CXKkEcD3', 0, NULL, NULL),
(2, 'official', 'Puskás Aréna, Budapest', 'Koncert', 'Pitbull - I\'m Back! Tour 2026', '2026-07-21 13:00:00', 1, 'https://www.ticketswap.hu/concert-tickets/pitbull-budapest-puskas-arena-2026-07-21-CUN5566Cvp2v9ErCLSe96', 0, NULL, NULL),
(3, 'official', 'Budapest Park, Budapest', 'Koncert', 'Desh Dupla', '2026-07-17 13:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/desh-dupla-budapest-budapest-park-2026-07-17-CZE1Vo92qj6iRJe31jjjQ', 0, NULL, NULL),
(4, 'official', 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok, Budapest', 'Koncert', 'Sting 3.0', '2026-06-18 16:00:00', 3, 'https://www.ticketswap.hu/concert-tickets/sting-budapest-mvm-dome-budapesti-multifunkcionalis-sportcsarnok-2026-06-18-CTgKo7yhsxek4uPb4d2zf', 0, NULL, NULL),
(5, 'official', 'Sziget Festival Official, Budapest', 'Koncert', 'DJ OTI und die Freunde - Óbudai-sziget Nagyrét', '2026-08-08 11:00:00', 4, 'https://www.ticketswap.hu/concert-tickets/dj-oti-und-die-freunde-obudai-sziget-nagyret-budapest-sziget-festival-official-2026-08-08-CVyn3F42uac6NaE1bHLEC', 0, NULL, NULL),
(6, 'official', 'Budapest Park, Budapest', 'Koncert', 'Marilyn Manson', '2026-07-22 15:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/marilyn-manson-budapest-budapest-park-2026-07-22-CVUkbqG7gc4kPUtATgYtj', 0, NULL, NULL),
(7, 'official', 'Budapest Park, Budapest', 'Koncert', 'MAJKA 2026', '2026-06-20 13:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/majka-budapest-budapest-park-2026-06-20-CX7SgsiriSybYQbxsJ3fX', 0, NULL, NULL),
(8, 'official', 'Budapest Park, Budapest', 'Koncert', 'OG Fluor', '2026-07-03 13:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/fluor-tomi-budapest-budapest-park-2026-07-03-BFkzbLNQuJX3FTG6UDUnfs', 0, NULL, NULL),
(9, 'official', 'Vajdahunyad Vára, Budapest', 'Koncert', 'Mahmut Orhan by City Takeover', '2026-06-12 16:00:00', 5, 'https://www.ticketswap.hu/concert-tickets/mahmut-orhan-by-city-takeover-budapest-vajdahunyad-vara-2026-06-12-CXyFu91NKz4ywLct7sqMT', 0, NULL, NULL),
(10, 'official', 'Budapest Park, Budapest', 'Koncert', 'Papa Roach', '2026-06-09 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/papa-roach-budapest-budapest-park-2026-06-09-CVi6rPeYahQ11KbQPGM8r', 0, NULL, NULL),
(11, 'official', 'Papp László Budapest SportAréna, Budapest', 'Koncert', 'KUPLUNG Zenekar - Aréna | 2026.11.06.', '2026-11-06 16:00:00', 6, 'https://www.ticketswap.hu/concert-tickets/kuplung-zenekar-arena-20261106-budapest-papp-laszlo-budapest-sportarena-2026-11-06-CWejQXvvKdtsQHawfX95q', 0, NULL, NULL),
(12, 'official', 'Budapest Park, Budapest', 'Koncert', 'Empire Of The Sun: Ask That God Tour', '2026-06-07 15:30:00', 2, 'https://www.ticketswap.hu/concert-tickets/empire-of-the-sun-budapest-budapest-park-2026-06-07-CXZUD6HhoHX17tDLGGBR1', 0, NULL, NULL),
(13, 'official', 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok, Budapest', 'Koncert', 'Pitbull - I\'m Back!', '2026-11-24 20:00:00', 3, 'https://www.ticketswap.hu/concert-tickets/pitbull-budapest-mvm-dome-budapesti-multifunkcionalis-sportcsarnok-2026-11-24-CYub9DNMfeEdiR6uhMiY1', 0, NULL, NULL),
(14, 'official', 'Budapest Park, Budapest', 'Koncert', 'BSW', '2026-08-07 13:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/bsw-budapest-budapest-park-2026-08-07-CYEwqSDZtNRNu5NuejUtd', 0, NULL, NULL),
(15, 'official', 'Papp László Budapest SportAréna, Budapest', 'Koncert', 'OneRepublic', '2026-06-25 16:00:00', 6, 'https://www.ticketswap.hu/concert-tickets/onerepublic-budapest-papp-laszlo-budapest-sportarena-2026-06-25-CV3oF7pCMoTB5mdP3xLqN', 0, NULL, NULL),
(16, 'official', 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok, Budapest', 'Koncert', 'Scorpions', '2026-06-20 15:00:00', 3, 'https://www.ticketswap.hu/concert-tickets/scorpions-budapest-mvm-dome-budapesti-multifunkcionalis-sportcsarnok-2026-06-20-CVw2is5fttDPkLqmhMHAN', 0, NULL, NULL),
(17, 'official', 'Budapest Park, Budapest', 'Koncert', 'Moby', '2026-08-01 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/moby-budapest-budapest-park-2026-08-01-CVoHQYuFHPDhBhVacTXhB', 0, NULL, NULL),
(18, 'official', 'Budapest Park, Budapest', 'Koncert', 'Mehringer', '2026-07-16 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/mehringer-budapest-budapest-park-2026-07-16-CVurreqmqNgsLfMpsv5Ti', 0, NULL, NULL),
(19, 'official', 'Müpa, Budapest', 'Koncert', 'gyuris, Balázs-Piri Soma, Bagyinszki Bánk – útvesz', '2026-06-07 16:00:00', 11, 'https://www.ticketswap.hu/concert-tickets/gyuris-balazs-piri-soma-bagyinszki-bank-utveszto-hey-june-budapest-mupa-2026-06-07-CY2fFA4rhEU3gvHELEFjx', 0, NULL, NULL),
(20, 'official', 'Papp László Budapest SportAréna, Budapest', 'Koncert', 'Lenny Kravitz', '2026-08-02 16:00:00', 6, 'https://www.ticketswap.hu/concert-tickets/lenny-kravitz-budapest-papp-laszlo-budapest-sportarena-2026-08-02-CVFGnS3MyMbqXgXBQwhhb', 0, NULL, NULL),
(21, 'official', 'Budapest Park, Budapest', 'Koncert', 'Bongor - EXTÁZIS', '2026-09-09 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/bongor-extazis-budapest-budapest-park-2026-09-09-CWGfq17Qn3uBhvGSwSMot', 0, NULL, NULL),
(22, 'official', 'Budapest Park, Budapest', 'Koncert', 'Mac DeMarco', '2026-06-23 15:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/mac-demarco-budapest-budapest-park-2026-06-23-CUZnHZHDrgLAbi6Qqti8g', 0, NULL, NULL),
(23, 'official', 'Budapest Park, Budapest', 'Koncert', 'Elefánt koncert', '2026-06-05 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/elefant-koncert-budapest-budapest-park-2026-06-05-CZAVbVurTvkj3uWz8yUzZ', 0, NULL, NULL),
(24, 'official', 'Budapest Park, Budapest', 'Koncert', 'Rise Against', '2026-07-01 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/rise-against-budapest-budapest-park-2026-07-01-CXZUznB58iA6VU6TYeayw', 0, NULL, NULL),
(25, 'official', 'Budapest Park, Budapest', 'Koncert', 'Blahalouisiana', '2026-06-11 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/blahalouisiana-budapest-budapest-park-2026-06-11-CXRcdW13KXKBQjPay7z53', 0, NULL, NULL),
(26, 'official', 'Budapest Park, Budapest', 'Koncert', 'Jason Derulo', '2026-06-10 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/jason-derulo-budapest-budapest-park-2026-06-10-CYgpiRiQ2FFjAFeQoaBJH', 0, NULL, NULL),
(27, 'official', 'Budapest Park, Budapest', 'Koncert', 'Zaz', '2026-06-29 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/zaz-budapest-budapest-park-2026-06-29-CXmpAJKoQHYbN5EdU9pjP', 0, NULL, NULL),
(28, 'official', 'Budapest Park, Budapest', 'Koncert', 'Total Dance Cabrio 10. Jubileum', '2026-06-13 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/total-dance-cabrio-10-jubileum-budapest-budapest-park-2026-06-13-CWMSPWW2YbSr7J37sr1JJ', 0, NULL, NULL),
(29, 'official', 'Városligeti Műjégpálya, Budapest', 'Koncert', 'Candle Lake - AVICII SYMPHONIC Tribute Concert', '2026-06-20 17:30:00', 7, 'https://www.ticketswap.hu/concert-tickets/candle-lake-avicii-symphonic-tribute-concert-budapest-varosligeti-mujegpalya-2026-06-20-CZwx7k8QeWzAaEFiWLC9e', 0, NULL, NULL),
(30, 'official', 'Barba Negra, Budapest', 'Koncert', 'Breaking Benjamin - UK/EU Tour', '2026-06-25 15:00:00', 8, 'https://www.ticketswap.hu/concert-tickets/breaking-benjamin-uk-eu-tour-budapest-barba-negra-2026-06-25-CW8PA66KLWGffQjsxXKx5', 0, NULL, NULL),
(31, 'official', 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok, Budapest', 'Koncert', 'Bryan Adams', '2026-12-16 14:00:00', 3, 'https://www.ticketswap.hu/concert-tickets/bryan-adams-budapest-mvm-dome-budapesti-multifunkcionalis-sportcsarnok-2026-12-16-CYg2bR2uVQup1sRXwYkX7', 0, NULL, NULL),
(32, 'official', 'Óbuda Bay, Budapest', 'Koncert', 'Deep Dish (classic set) x The Debut 25th Bday', '2026-06-20 10:00:00', 9, 'https://www.ticketswap.hu/concert-tickets/deep-dish-budapest-obuda-bay-2026-06-20-CZ18dkCfMpiZud6wCgHjz', 0, NULL, NULL),
(33, 'official', 'Barba Negra, Budapest', 'Koncert', 'Alvaro Soler koncert', '2026-06-05 16:00:00', 8, 'https://www.ticketswap.hu/concert-tickets/alvaro-soler-koncert-budapest-barba-negra-2026-06-05-CVqpEqyz3mPANqBYgcVYw', 0, NULL, NULL),
(34, 'official', 'Budapest Park, Budapest', 'Koncert', 'Majka', '2026-06-19 13:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/majka-budapest-budapest-park-2026-06-19-CZh3fNhxx6agjRqZZbRqL', 0, NULL, NULL),
(35, 'official', 'Akvárium Klub, Budapest', 'Koncert', 'Dogstar - Budapest - Akvarium Klub - Jul 18, 2026', '2026-07-18 16:00:00', 10, 'https://www.ticketswap.hu/concert-tickets/dogstar-budapest-akvarium-klub-jul-18-2026-budapest-akvarium-klub-2026-07-18-CViY7EwzrY67FCzqKBw7z', 0, NULL, NULL),
(36, 'official', 'Budapest Park, Budapest', 'Koncert', 'A Perfect Circle', '2026-06-15 15:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/a-perfect-circle-budapest-budapest-park-2026-06-15-CUZvRjmuhMwyHQ9DS8WqN', 0, NULL, NULL),
(37, 'official', 'Budapest Park, Budapest', 'Koncert', 'Aurevoir.', '2026-06-12 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/aurevoir-budapest-budapest-park-2026-06-12-CXt7x9v4d6emMV9bTDzaV', 0, NULL, NULL),
(38, 'official', 'Müpa, Budapest', 'Koncert', 'Indigo – Ébredés / HEY, JUNE!', '2026-06-08 16:00:00', 11, 'https://www.ticketswap.hu/concert-tickets/indigo-ebredes-hey-june-budapest-mupa-2026-06-08-CY2fEQEshGqapH4r2nKJY', 0, NULL, NULL),
(39, 'official', 'Budapest Park, Budapest', 'Koncert', 'Horváth Tamás pres.: 11 démon', '2026-06-26 14:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/horvath-tamas-budapest-budapest-park-2026-06-26-CW3KhLvgBDXUwsLFo8QEn', 0, NULL, NULL),
(40, 'official', 'Barba Negra, Budapest', 'Koncert', 'In Flames', '2026-07-25 15:00:00', 8, 'https://www.ticketswap.hu/concert-tickets/in-flames-budapest-barba-negra-2026-07-25-CVaokqYrfYyqxQf9PdQLi', 0, NULL, NULL),
(41, 'official', 'Papp László Budapest SportAréna, Budapest', 'Koncert', 'Kuplung Zenekar - Aréna', '2026-11-07 16:00:00', 6, 'https://www.ticketswap.hu/concert-tickets/kuplung-zenekar-arena-budapest-papp-laszlo-budapest-sportarena-2026-11-07-CYDxc4uQS3Zq7q5dhExam', 0, NULL, NULL),
(42, 'official', 'Papp László Budapest SportAréna, Budapest', 'Koncert', 'Ricky Martin', '2026-07-06 07:00:00', 6, 'https://www.ticketswap.hu/concert-tickets/ricky-martin-budapest-papp-laszlo-budapest-sportarena-2026-07-06-CYQxU59cEKJftAGFXFh8E', 0, NULL, NULL),
(43, 'official', 'Müpa, Budapest', 'Koncert', 'Anima Sound System: 30 éves a Hungarian Astronau -', '2026-06-10 16:00:00', 11, 'https://www.ticketswap.hu/concert-tickets/anima-sound-system-30-eves-a-hungarian-astronau-lemezujrajatszo-koncert-hey-june-budapest-mupa-2026-06-10-CY2fH1Hprys6Cx1snBAot', 0, NULL, NULL),
(44, 'official', 'Budapest Park, Budapest', 'Koncert', 'Palaye Royale', '2026-06-29 20:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/palaye-royale-budapest-budapest-park-2026-06-30-CYhxS3RgbxxC5yUuqfPSo', 0, NULL, NULL),
(45, 'official', 'Arzenál, Budapest', 'Koncert', 'Hive On Tour - Budapest W/ Toxic Machinery, Nicola', '2026-06-05 18:00:00', 55, 'https://www.ticketswap.hu/concert-tickets/hive-on-tour-budapest-w-toxic-machinery-nicolas-julian-more-budapest-arzenal-2026-06-05-CZCnVZRkuWr2FUxJbAdVZ', 0, NULL, NULL),
(46, 'official', 'Budapest Park, Budapest', 'Koncert', 'Of Monsters and Men', '2026-06-22 15:00:00', 2, 'https://www.ticketswap.hu/concert-tickets/of-monsters-and-men-budapest-budapest-park-2026-06-22-CVxxB8GcdXxFEgaFhXjqD', 0, NULL, NULL),
(47, 'official', 'Sziget Festival Official, Budapest', 'Fesztivál', 'Sziget Festival 2026', '2026-08-10 04:00:00', 4, 'https://www.ticketswap.hu/festival-tickets/sziget-festival-2026-budapest-sziget-festival-official-2026-08-10-CUo21PRNssUkMvwbigkY4', 0, NULL, NULL),
(48, 'official', 'Millenáris, Budapest', 'Fesztivál', 'Gourmet Fesztivál 2026', '2026-06-04 10:00:00', 12, 'https://www.ticketswap.hu/festival-tickets/gourmet-fesztival-2026-budapest-millenaris-2026-06-04-CVUScjqcwWGeAjkr8ojUW', 0, NULL, NULL),
(49, 'official', 'Kamaraerdei Ifjúsági Park , Budapest', 'Fesztivál', 'Levendula Piknik 2026', '2026-06-27 10:00:00', 13, 'https://www.ticketswap.hu/festival-tickets/levendula-piknik-2026-budapest-kamaraerdei-ifjusagi-park-2026-06-27-CaBCqGgksFMqsVAmjmGcG', 0, NULL, NULL),
(50, 'official', 'Városháza park, Budapest', 'Fesztivál', 'Jazzfest Budapest 2026 - 3rd day - June 29, 2026', '2026-06-29 12:00:00', 14, 'https://www.ticketswap.hu/festival-tickets/jazzfest-budapest-2026-3rd-day-june-29-2026-budapest-varoshaza-park-2026-06-29-CWsot3TwM6rTcATivF3pC', 0, NULL, NULL),
(51, 'official', 'Magyar Vasúttörténeti Park, Budapest', 'Fesztivál', 'HOLILAND 2026 │ Vasúttörténeti Park │ 06.19.', '2026-06-19 15:00:00', 15, 'https://www.ticketswap.hu/festival-tickets/holiland-2026-vasuttorteneti-park-0619-budapest-magyar-vasuttorteneti-park-2026-06-19-CaQTU4qaNZEdNvFF5W9rD', 0, NULL, NULL),
(52, 'official', 'Hungexpo, Budapest', 'Fesztivál', 'BÓNUSZ Electronic Music Festival 2026', '2026-11-13 18:00:00', 16, 'https://www.ticketswap.hu/festival-tickets/bonusz-electronic-music-festival-2026-budapest-hungexpo-2026-11-13-CVobDTnTgWUGzTY4S2GYp', 0, NULL, NULL),
(53, 'official', 'Dürer Kert, Budapest', 'Fesztivál', 'Monolit Festival 2026', '2026-07-22 20:00:00', 25, 'https://www.ticketswap.hu/festival-tickets/monolit-festival-2026-budapest-durer-kert-2026-07-23-CZ9xVijzUPHKEokyFGuMs', 0, NULL, NULL),
(54, 'official', 'Hungexpo A pavilon, Budapest', 'Fesztivál', 'Dental World 2026 - Free Visitor Registration', '2026-10-08 05:00:00', 17, 'https://www.ticketswap.hu/festival-tickets/dental-world-2026-free-visitor-registration-budapest-hungexpo-a-pavilon-2026-10-08-CV3sAsjEWUfFfgHUvbroo', 0, NULL, NULL),
(55, 'official', 'CEU Auditorium, Kispest', 'Fesztivál', 'Service Design Day 2026', '2026-10-14 05:00:00', 18, 'https://www.ticketswap.hu/festival-tickets/service-design-day-2026-kispest-ceu-auditorium-2026-10-14-CV3sUHhrL3vHteYC2NdSd', 0, NULL, NULL),
(56, 'official', 'Margitszigeti Szabadtéri Színpad, Budapest', 'Fesztivál', 'MARGIT TERASZ VIP BÜFÉ VOCHER', '2026-06-04 16:00:00', 19, 'https://www.ticketswap.hu/festival-tickets/margit-terasz-vip-bufe-vocher-budapest-margitszigeti-szabadteri-szinpad-2026-06-04-CVBRKjxQfby9w8KCm7NKv', 0, NULL, NULL),
(57, 'official', 'Margitszigeti Szabadtéri Színpad, Budapest', 'Fesztivál', 'MARGIT TERASZ VIP BÜFÉ VOCHER', '2026-06-06 16:00:00', 19, 'https://www.ticketswap.hu/festival-tickets/margit-terasz-vip-bufe-vocher-budapest-margitszigeti-szabadteri-szinpad-2026-06-06-CVBRKo3hPW3C1KQW9hUDJ', 0, NULL, NULL),
(58, 'official', 'Margitszigeti Szabadtéri Színpad, Budapest', 'Fesztivál', 'MARGIT TERASZ VIP BÜFÉ VOCHER', '2026-08-13 16:00:00', 19, 'https://www.ticketswap.hu/festival-tickets/margit-terasz-vip-bufe-vocher-budapest-margitszigeti-szabadteri-szinpad-2026-08-13-CVBRLNMRAG6iSoT8eUkAq', 0, NULL, NULL),
(59, 'official', 'Margitszigeti Szabadtéri Színpad, Budapest', 'Fesztivál', 'MARGIT TERASZ VIP BÜFÉ VOCHER', '2026-08-26 16:00:00', 19, 'https://www.ticketswap.hu/festival-tickets/margit-terasz-vip-bufe-vocher-budapest-margitszigeti-szabadteri-szinpad-2026-08-26-CVBRLaC4hPCcqSpCithTa', 0, NULL, NULL),
(60, 'official', 'Milleraris Üvegcsarnok, Budapest', 'Fesztivál', 'WMN Fesztivál 2026', '2026-09-19 06:00:00', 20, 'https://www.ticketswap.hu/festival-tickets/wmn-fesztival-2026-budapest-milleraris-uvegcsarnok-2026-09-19-CWX7X2XKubw5izykmZDcU', 0, NULL, NULL),
(61, 'official', 'Városháza park, Budapest', 'Fesztivál', 'Jazzfest Budapest 2026 - 5th day - July 1, 2026', '2026-07-01 12:00:00', 14, 'https://www.ticketswap.hu/festival-tickets/jazzfest-budapest-2026-5th-day-july-1-2026-budapest-varoshaza-park-2026-07-01-CWsoqnAspEAFMcSD8VC9t', 0, NULL, NULL),
(62, 'official', 'Öreg Tölgy Kastély-Fogadó, Pusztazámor', 'Fesztivál', 'Authentic Piknik • Cars & Bikes & Coffee • Pusztaz', '2026-08-02 07:30:00', 56, 'https://www.ticketswap.hu/festival-tickets/authentic-piknik-cars-bikes-coffee-pusztazamori-kastely-pusztazamor-oreg-tolgy-kastely-fogado-2026-08-02-CXLVP7mbZNsXnKU7xeR1V', 0, NULL, NULL),
(63, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Folklór Előadás a Gasztró Pincében', '2026-06-27 15:00:00', 21, 'https://www.ticketswap.hu/festival-tickets/folklor-eloadas-a-gasztro-pinceben-budapest-hungaria-koncert-kft-2026-06-27-CXoRcQGYXVL5rNxJW4gKF', 0, NULL, NULL),
(64, 'official', 'Széchenyi Thermal Bath, Budapest', 'Fesztivál', 'CineSpa at Széchenyi Bath', '2026-07-01 17:00:00', 22, 'https://www.ticketswap.hu/festival-tickets/cinespa-at-szechenyi-bath-budapest-szechenyi-thermal-bath-2026-07-01-CXsKtegjBuLBf7zdNAtLd', 0, NULL, NULL),
(65, 'official', 'UP Rendezvénytér, Budapest', 'Fesztivál', 'META-INF Atlassian Day 2026', '2026-06-09 04:30:00', 23, 'https://www.ticketswap.hu/festival-tickets/meta-inf-atlassian-day-2026-budapest-up-rendezvenyter-2026-06-09-CXtgC2WvzoTS7RTwTbiDe', 0, NULL, NULL),
(66, 'official', 'Bálna, Budapest', 'Fesztivál', 'Vingardium - In The CITY', '2026-10-10 13:00:00', 24, 'https://www.ticketswap.hu/festival-tickets/vingardium-in-the-city-budapest-balna-2026-10-10-CY7vo13Ygcqw42Fc6fMRt', 0, NULL, NULL),
(67, 'official', 'UP Rendezvénytér, Budapest', 'Fesztivál', '06. 07. Zinzino Day - Dr. Martina Torrissen, Dr. S', '2026-06-07 06:00:00', 23, 'https://www.ticketswap.hu/festival-tickets/06-07-zinzino-day-dr-martina-torrissen-dr-szucs-zoltan-es-meg-sokan-masok-budapest-up-rendezvenyter-2026-06-07-CY7vsEoNyH7WMW9dQ6Ni9', 0, NULL, NULL),
(68, 'official', 'Dürer Kert, Budapest', 'Fesztivál', 'EDGE Architecture Festival Budapest (EDGE Fest)', '2026-06-18 05:00:00', 25, 'https://www.ticketswap.hu/festival-tickets/edge-architecture-festival-budapest-edge-fest-budapest-durer-kert-2026-06-18-CYFW4GUGKfrCg8CWTsAFd', 0, NULL, NULL),
(69, 'official', 'BMC - Budapest Music Center, Budapest', 'Fesztivál', 'A zeneimádó - Kalandra Fül Fesztivál - Danubia Zen', '2027-02-27 13:00:00', 57, 'https://www.ticketswap.hu/festival-tickets/a-zeneimado-kalandra-ful-fesztival-danubia-zenekar-budapest-bmc-budapest-music-center-2027-02-27-CYp7ELTrKX1b5238BMHQp', 0, NULL, NULL),
(70, 'official', 'Palazzo Permanens, Budapest', 'Fesztivál', 'FREE SEQUENCE LABEL NIGHT', '2027-04-23 16:00:00', 26, 'https://www.ticketswap.hu/festival-tickets/free-sequence-label-night-budapest-palazzo-permanens-2027-04-23-CZ18LW5czKJHLpSDMWscY', 0, NULL, NULL),
(71, 'official', 'Kelenföldi pályaudvar, Budapest', 'Fesztivál', 'Wonder Lights Lavander Festival: Hike - Swim - Bre', '2026-07-04 04:15:00', 58, 'https://www.ticketswap.hu/festival-tickets/wonder-lights-lavander-festival-hike-swim-breath-and-connect-budapest-kelenfoldi-palyaudvar-2026-07-04-CZPmPrMkTTsjK7dSBXbi4', 0, NULL, NULL),
(72, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Családi Villásreggeli városnéző hajókirándulással', '2026-06-06 06:30:00', 21, 'https://www.ticketswap.hu/festival-tickets/csaladi-villasreggeli-varosnezo-hajokirandulassal-budapest-hungaria-koncert-kft-2026-06-06-CZdMryWrnX7u1aBLzyzk7', 0, NULL, NULL),
(73, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Családi Villásreggeli városnéző hajókirándulással', '2026-06-13 06:30:00', 21, 'https://www.ticketswap.hu/festival-tickets/csaladi-villasreggeli-varosnezo-hajokirandulassal-budapest-hungaria-koncert-kft-2026-06-13-CZdMs2aRHujey1bdc6XUW', 0, NULL, NULL),
(74, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Családi Villásreggeli városnéző hajókirándulással', '2026-07-18 06:30:00', 21, 'https://www.ticketswap.hu/festival-tickets/csaladi-villasreggeli-varosnezo-hajokirandulassal-budapest-hungaria-koncert-kft-2026-07-18-CZdMsJStzqv7MNxQx6Du7', 0, NULL, NULL),
(75, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Családi Villásreggeli városnéző hajókirándulással', '2026-07-25 06:30:00', 21, 'https://www.ticketswap.hu/festival-tickets/csaladi-villasreggeli-varosnezo-hajokirandulassal-budapest-hungaria-koncert-kft-2026-07-25-CZdMsMQkCPbWXAgb8b9N6', 0, NULL, NULL),
(76, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Családi Villásreggeli városnéző hajókirándulással', '2026-10-03 06:30:00', 21, 'https://www.ticketswap.hu/festival-tickets/csaladi-villasreggeli-varosnezo-hajokirandulassal-budapest-hungaria-koncert-kft-2026-10-03-CZdMstLqX3A367T7UPCuz', 0, NULL, NULL),
(77, 'official', 'Hungária Koncert Kft, Budapest', 'Fesztivál', 'Családi Villásreggeli városnéző hajókirándulással', '2026-11-07 08:30:00', 21, 'https://www.ticketswap.hu/festival-tickets/csaladi-villasreggeli-varosnezo-hajokirandulassal-budapest-hungaria-koncert-kft-2026-11-07-CZdMt9sjeccA553mdukz7', 0, NULL, NULL),
(78, 'official', 'Millennium Kávéház és Étterem, Budapest', 'Fesztivál', 'The Best Model of Hungary 2026. Döntő', '2026-07-08 14:00:00', 27, 'https://www.ticketswap.hu/festival-tickets/the-best-model-of-hungary-2026-donto-budapest-millennium-kavehaz-es-etterem-2026-07-08-CZrGovMjx2yBVy64gRobB', 0, NULL, NULL),
(79, 'official', 'Casa Pomo D\'Oro, Budapest', 'Fesztivál', 'Olaszul l\'enni jó: Pasta e sughi // Friss házi tés', '2026-06-07 07:00:00', 59, 'https://www.ticketswap.hu/festival-tickets/olaszul-lenni-jo-pasta-e-sughi-friss-hazi-tesztak-olasz-alapszoszokkal-budapest-casa-pomo-doro-2026-06-07-CZwx8hipumKJtoR8aeDzV', 0, NULL, NULL),
(80, 'official', 'Casa Pomo D\'Oro, Budapest', 'Fesztivál', 'Olaszul l\'enni jó: Pasta e sughi // Friss házi tés', '2026-06-21 07:00:00', 59, 'https://www.ticketswap.hu/festival-tickets/olaszul-lenni-jo-pasta-e-sughi-friss-hazi-tesztak-olasz-alapszoszokkal-budapest-casa-pomo-doro-2026-06-21-CZwx8kxJ68GsBPLW4gLye', 0, NULL, NULL),
(81, 'official', 'Casa Pomo D\'Oro, Budapest', 'Fesztivál', 'Olaszul l\'enni jó: Pasta e sughi // Friss házi tés', '2026-06-28 07:00:00', 59, 'https://www.ticketswap.hu/festival-tickets/olaszul-lenni-jo-pasta-e-sughi-friss-hazi-tesztak-olasz-alapszoszokkal-budapest-casa-pomo-doro-2026-06-28-CZwx8pA22QpFbuNmhsghp', 0, NULL, NULL),
(82, 'official', 'Casa Pomo D\'Oro, Budapest', 'Fesztivál', 'Olaszul l\'enni jó: Carni e Frutti di mare // Húsok', '2026-06-14 07:00:00', 59, 'https://www.ticketswap.hu/festival-tickets/olaszul-lenni-jo-carni-e-frutti-di-mare-husok-es-tenger-gyumolcsei-budapest-casa-pomo-doro-2026-06-14-CZwx8yw99mu3guMmeeYaN', 0, NULL, NULL),
(83, 'official', 'Óbudai Társaskör , Budapest', 'Fesztivál', 'VIII. Óbudai ZeneZug Fesztivál - Ránki Fülöp és a ', '2026-06-06 14:00:00', 60, 'https://www.ticketswap.hu/festival-tickets/viii-obudai-zenezug-fesztival-ranki-fulop-es-a-budapesti-vonosok-budapest-obudai-tarsaskor-2026-06-06-CZxHcJ8jWVoTsFF9ahUVX', 0, NULL, NULL),
(84, 'official', 'Óbudai Társaskör , Budapest', 'Fesztivál', 'VIII. Óbudai ZeneZug Fesztivál - Miből lesz a cser', '2026-06-05 14:00:00', 60, 'https://www.ticketswap.hu/festival-tickets/viii-obudai-zenezug-fesztival-mibol-lesz-a-cserebogar-budapest-obudai-tarsaskor-2026-06-05-CZxHcQA8JPd6bjeMMqwxK', 0, NULL, NULL),
(85, 'official', 'JOZSOO alkotóműhely, Budapest', 'Fesztivál', 'TEXTÚRA FESTÉS', '2026-06-14 07:00:00', 28, 'https://www.ticketswap.hu/festival-tickets/textura-festes-budapest-jozsoo-alkotomuhely-2026-06-14-Ca5XNY2vNuy1g23jzX1Xy', 0, NULL, NULL),
(86, 'official', 'Érd Főtér, Érd', 'Fesztivál', 'ÉRDI PIKNIK 7.0 - Fiesta Edition - 2026.06.12-13. ', '2026-06-12 14:00:00', 61, 'https://www.ticketswap.hu/festival-tickets/erdi-piknik-70-fiesta-edition-20260612-13-1-nap-erd-erd-foter-2026-06-12-CaBCtPXrDm5oymaYzb5t4', 0, NULL, NULL),
(87, 'official', 'Érd Főtér, Érd', 'Fesztivál', 'ÉRDI PIKNIK 7.0 - Fiesta Edition - 2026.06.12-13. ', '2026-06-13 14:00:00', 61, 'https://www.ticketswap.hu/festival-tickets/erdi-piknik-70-fiesta-edition-20260612-13-2-nap-erd-erd-foter-2026-06-13-CaBCtSs1pf7rafTWqX3Eh', 0, NULL, NULL),
(88, 'official', 'HUNGEXPO Kongresszusi Központ, Budapest', 'Fesztivál', 'Budapest Comic Con 2027', '2027-03-06 08:00:00', 29, 'https://www.ticketswap.hu/festival-tickets/budapest-comic-con-2027-budapest-hungexpo-kongresszusi-kozpont-2027-03-06-CaGWv5HQFYxSCXyoc3nXC', 0, NULL, NULL),
(89, 'official', 'Etyeki Kúria Borgazdaság Winery, Etyek', 'Fesztivál', 'ChardonnÉJ / Etyeki Kúria', '2026-06-13 13:00:00', 30, 'https://www.ticketswap.hu/festival-tickets/chardonnej-etyeki-kuria-etyek-etyeki-kuria-borgazdasag-winery-2026-06-13-CaQTT3LGHPg5CDhbjqNQa', 0, NULL, NULL),
(90, 'official', 'Wiking Yacht Club - Marina Part, Budapest', 'Fesztivál', 'Wiking Yacht Club - Szezonnyitó Marina Part', '2026-06-13 10:00:00', 31, 'https://www.ticketswap.hu/festival-tickets/wiking-yacht-club-szezonnyito-marina-part-budapest-wiking-yacht-club-marina-part-2026-06-13-CaQTVWZuyGHH8zNacQZKu', 0, NULL, NULL),
(91, 'official', 'Dömörkapu Rengeteg, Szentendre', 'Fesztivál', 'II. Rengeteg Dalköltő Fesztivál', '2026-07-03 12:00:00', 32, 'https://www.ticketswap.hu/festival-tickets/ii-rengeteg-dalkolto-fesztival-szentendre-domorkapu-rengeteg-2026-07-03-CaQTX8HX7TDrb11xkiisD', 0, NULL, NULL),
(92, 'official', 'Hungaroring, Mogyoród', 'Sport', 'Hungarian Grand Prix | Budapest F1 2026', '2026-07-24 06:00:00', 33, 'https://www.ticketswap.hu/sport-tickets/hungarian-grand-prix-budapest-f1-2026-2026-07-24-CXjQHyBnY2Cda7DEmFYSR', 0, NULL, NULL),
(93, 'official', 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok, Budapest', 'Sport', 'EHF Final4 Women 2026', '2026-06-06 08:00:00', 3, 'https://www.ticketswap.hu/sport-tickets/ehf-final4-women-2026-2026-06-06-CVzzenAfJbedZnLPYtRy1', 0, NULL, NULL),
(94, 'official', 'Nemzeti Atlétikai Központ, Budapest', 'Sport', 'World Athletics Ultimate Championship Budapest 202', '2026-09-11 06:00:00', 62, 'https://www.ticketswap.hu/sport-tickets/world-athletics-ultimate-championship-budapest-2026-2026-09-11-CUrpJCm1mCjhdtCgaRwrk', 0, NULL, NULL),
(95, 'official', 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok, Budapest', 'Sport', 'Hungarian Darts Trophy 2026', '2026-08-28 08:00:00', 3, 'https://www.ticketswap.hu/sport-tickets/hungarian-darts-trophy-2026-2026-08-28-CYT1PKvL2yrMXx1sSmdqG', 0, NULL, NULL),
(96, 'official', 'Nemzeti Atlétikai Központ, Budapest', 'Sport', 'Gyulai István Memorial – Atlétikai Magyar Nagydíj ', '2026-07-14 09:00:00', 62, 'https://www.ticketswap.hu/sport-tickets/gyulai-istvan-memorial-atletikai-magyar-nagydij-2026-2026-07-14-CX9meaYAc9SuepfDQwVLM', 0, NULL, NULL),
(97, 'official', 'Papp László Budapest SportAréna, Budapest', 'Sport', 'HEXAGONE MMA Hungary 2026', '2026-06-06 13:30:00', 6, 'https://www.ticketswap.hu/sport-tickets/hexagone-mma-hungary-2026-2026-06-06-CYHpBhP2C9g1minE9pJHw', 0, NULL, NULL),
(98, 'official', 'Top Padel Club, Budapest', 'Sport', 'Pilates&Padel: Hotties on the Court', '2026-06-21 07:00:00', 34, 'https://www.ticketswap.hu/sport-tickets/pilatespadel-hotties-on-the-court-2026-06-21-CaY2jt7xwwacL1n3K4oej', 0, NULL, NULL),
(99, 'official', 'Városligeti Műjégpálya, Budapest', 'Sport', 'PÉNTEK - STIHL TIMBERSPORTS World Trophy 2026', '2026-06-05 15:00:00', 7, 'https://www.ticketswap.hu/sport-tickets/pentek-stihl-timbersports-world-trophy-2026-2026-06-05-CZAWf7N1zQdryGUVVBGks', 0, NULL, NULL),
(100, 'official', 'Városligeti Műjégpálya, Budapest', 'Sport', 'SZOMBAT - STIHL TIMBERSPORTS World Trophy 2026', '2026-06-06 12:00:00', 7, 'https://www.ticketswap.hu/sport-tickets/szombat-stihl-timbersports-world-trophy-2026-2026-06-06-CZGCB3EcndNERDzbmyLFz', 0, NULL, NULL),
(101, 'official', 'Budapest, Budapest', 'Sport', 'Budapest Marathon 2026', '2026-10-10 05:00:00', 35, 'https://www.ticketswap.hu/sport-tickets/budapest-marathon-2026-2026-10-10-CUruZC84bmKCZe4nGZhyX', 0, NULL, NULL),
(102, 'official', 'SUP Budapest, Budapest', 'Sport', 'Hallstatt SUP Adventure 2026', '2026-07-23 05:00:00', 36, 'https://www.ticketswap.hu/sport-tickets/hallstatt-sup-adventure-2026-2026-07-23-CVNtx39TkMqna2mHtAJA5', 0, NULL, NULL),
(103, 'official', 'SUP Budapest, Budapest', 'Sport', 'SUP & Rafting weekend Croatia', '2026-06-19 05:00:00', 36, 'https://www.ticketswap.hu/sport-tickets/sup-rafting-weekend-croatia-2026-06-19-CVWU7XdqcdNf5ApN8Zgo5', 0, NULL, NULL),
(104, 'official', 'SUP Budapest, Budapest', 'Sport', 'Alpesi Kalandtúra a svájci-olasz határvidéken', '2026-08-20 05:00:00', 36, 'https://www.ticketswap.hu/sport-tickets/alpesi-kalandtura-a-svajci-olasz-hatarvideken-2026-08-20-CVc9VK5TobNNu8BASD5aY', 0, NULL, NULL),
(105, 'official', 'SUP Budapest, Budapest', 'Sport', 'Hike & SUP túra az Imotski tavaknál', '2026-06-11 02:00:00', 36, 'https://www.ticketswap.hu/sport-tickets/hike-sup-tura-az-imotski-tavaknal-2026-06-11-CVjirKJYs9p7qjdmTERW5', 0, NULL, NULL),
(106, 'official', 'Papp László Budapest SportAréna, Budapest', 'Sport', 'HARLEM GLOBETROTTERS - Magic Pass Meet&Greet', '2026-10-31 15:20:00', 6, 'https://www.ticketswap.hu/sport-tickets/harlem-globetrotters-magic-pass-meetgreet-2026-10-31-CWCe3tzB3vVgFUdKpHhRN', 0, NULL, NULL),
(107, 'official', 'Papp László Budapest SportAréna, Budapest', 'Sport', 'Parkolójegy', '2026-10-17 16:00:00', 6, 'https://www.ticketswap.hu/sport-tickets/parkolojegy-2026-10-17-CY8LetCMSLLVDh4MoPQLk', 0, NULL, NULL),
(108, 'official', 'Papp László Budapest SportAréna, Budapest', 'Sport', 'Seated test event', '2027-01-01 19:00:00', 6, 'https://www.ticketswap.hu/sport-tickets/seated-test-event-2027-01-01-CZAWdLvHePsT1QQJzL4NM', 0, NULL, NULL),
(109, 'official', 'Papp László Budapest SportAréna, Budapest', 'Sport', 'Parkolójegy', '2026-11-13 17:30:00', 6, 'https://www.ticketswap.hu/sport-tickets/parkolojegy-2026-11-13-CZVrc9rtk3Y8iEhaTETp4', 0, NULL, NULL),
(110, 'official', 'Kelenvölgyi Közösségi Ház, Budapest', 'Sport', 'Ökovölgy - napközis gyermektábor', '2026-08-10 04:00:00', 37, 'https://www.ticketswap.hu/sport-tickets/okovolgy-napkozis-gyermektabor-2026-08-10-CZdMQHmiUXrDEehPbydw9', 0, NULL, NULL),
(111, 'official', 'Hungaroring, Mogyoród', 'Sport', 'Gépész Szalon - MICN 2026', '2026-06-03 05:45:00', 33, 'https://www.ticketswap.hu/sport-tickets/gepesz-szalon-micn-2026-2026-06-03-CZwx6Y4LnD7NHsJ5QJodU', 0, NULL, NULL),
(112, 'official', 'Hungaroring, Mogyoród', 'Sport', 'PUKK - Pedig, ugye, kellene kezelned', '2026-06-03 05:45:00', 33, 'https://www.ticketswap.hu/sport-tickets/pukk-pedig-ugye-kellene-kezelned-2026-06-03-CZwx6bVU7rLyXnedUunnr', 0, NULL, NULL),
(113, 'official', 'Magyar Testnevelési és Sporttudományi Egyetem, Budapest', 'Sport', 'Physiology of Top Performance', '2026-06-29 05:00:00', 38, 'https://www.ticketswap.hu/sport-tickets/physiology-of-top-performance-2026-06-29-CaY2fZJGrwuPfHWKxCNWN', 0, NULL, NULL),
(114, 'official', 'Off Kultur, Budapest', 'Sport', 'Jim - Spin Drill Workshop / Skate Land Budapest / ', '2026-07-11 11:30:00', 63, 'https://www.ticketswap.hu/sport-tickets/jim-spin-drill-workshop-skate-land-budapest-0711-2026-07-11-CaY2m5Qtg1uKeLgRJjcx2', 0, NULL, NULL),
(115, 'official', 'Városliget Promenád, Budapest', 'Sport', 'Dev & Chan - Street Skating Basics Workshop / Skat', '2026-07-11 06:00:00', 64, 'https://www.ticketswap.hu/sport-tickets/dev-chan-street-skating-basics-workshop-skate-land-budapest-0711-2026-07-11-CaY2mKRGT1qpzKnbM6xdU', 0, NULL, NULL),
(116, 'official', 'Klauzál Gábor Művelődési Központ, Budapest', 'Sport', 'TFSE RG Gála', '2026-06-06 06:15:00', 39, 'https://www.ticketswap.hu/sport-tickets/tfse-rg-gala-2026-06-06-CaY2poAxPyyFqMMe8poAo', 0, NULL, NULL),
(117, 'official', 'Erkel Színház, Budapest', 'Színház', 'HOGYAN TUDNÉK ÉLNI NÉLKÜLED?', '2026-10-25 09:00:00', 40, 'https://www.ticketswap.hu/theatre-tickets/hogyan-tudnek-elni-nelkuled-budapest-erkel-szinhaz-2026-10-25-CZ3MEDkxRyTnSkY8P3NPE', 0, NULL, NULL),
(118, 'official', 'Átrium Színház, Budapest', 'Színház', 'Innen már csak gurulunk - Bödőcs Tibor önálló estj', '2026-06-07 13:00:00', 65, 'https://www.ticketswap.hu/theatre-tickets/innen-mar-csak-gurulunk-bodocs-tibor-onallo-estje-elozenekar-toth-edu-budapest-atrium-szinhaz-2026-06-07-CWCeJeN2XoNUjs5rWdYdi', 0, NULL, NULL),
(119, 'official', 'Erkel Színház, Budapest', 'Színház', 'HOGYAN TUDNÉK ÉLNI NÉLKÜLED?', '2026-10-24 11:00:00', 40, 'https://www.ticketswap.hu/theatre-tickets/hogyan-tudnek-elni-nelkuled-budapest-erkel-szinhaz-2026-10-24-CZ3ME92CfJos6TagNg86s', 0, NULL, NULL),
(120, 'official', 'Vígszínház, Budapest', 'Színház', '@LL3t4rgIA #éretlen komédia', '2026-06-13 15:00:00', 41, 'https://www.ticketswap.hu/theatre-tickets/ll3t4rgia-eretlen-komedia-budapest-vigszinhaz-2026-06-13-CYwg4bfz8Mk4fD612XrkP', 0, NULL, NULL),
(121, 'official', 'Magyar Állami Operaház / Hungarian State Opera, Budapest', 'Színház', 'Csipkerózsika', '2026-06-06 07:00:00', 42, 'https://www.ticketswap.hu/theatre-tickets/csipkerozsika-budapest-magyar-allami-operahaz-hungarian-state-opera-2026-06-06-Ca5schFGfoT1ybB9YbycV', 0, NULL, NULL),
(122, 'official', 'Vígszínház, Budapest', 'Színház', 'A Pál utcai fiúk', '2026-06-14 15:00:00', 41, 'https://www.ticketswap.hu/theatre-tickets/a-pal-utcai-fiuk-budapest-vigszinhaz-2026-06-14-CYwg47Z4gqcELx84zELyP', 0, NULL, NULL),
(123, 'official', 'Corvin Dumaszínház, Budapest', 'Színház', 'Innen már csak gurulunk - Bödőcs Tibor önálló estj', '2026-06-10 15:30:00', 66, 'https://www.ticketswap.hu/theatre-tickets/innen-mar-csak-gurulunk-bodocs-tibor-onallo-estje-elozenekar-toth-edu-budapest-corvin-dumaszinhaz-2026-06-10-CYMbEAG6KNQhxbMyNaLvR', 0, NULL, NULL),
(124, 'official', 'Madách Színház, Budapest', 'Színház', 'Jégvarázs', '2026-06-12 11:00:00', 43, 'https://www.ticketswap.hu/theatre-tickets/jegvarazs-budapest-madach-szinhaz-2026-06-12-CY2fDi2fB2sAmT2HTJWqd', 0, NULL, NULL),
(125, 'official', 'Magyar Állami Operaház / Hungarian State Opera, Budapest', 'Színház', 'Verdi: Macbeth, Anna Netrebko főpróba', '2026-06-06 14:00:00', 42, 'https://www.ticketswap.hu/theatre-tickets/verdi-macbeth-anna-netrebko-foproba-budapest-magyar-allami-operahaz-hungarian-state-opera-2026-06-06-CXmSX8iczLgy3UabeUWRQ', 0, NULL, NULL),
(126, 'official', 'Erkel Színház, Budapest', 'Színház', 'APÁCA SHOW', '2026-10-10 11:00:00', 40, 'https://www.ticketswap.hu/theatre-tickets/apaca-show-budapest-erkel-szinhaz-2026-10-10-CZ3MCo9qFmmaavWMirBGc', 0, NULL, NULL),
(127, 'official', 'Corvin Dumaszínház, Budapest', 'Színház', 'Marika for Prezident specziell - Rainer-Micsinyei ', '2026-06-20 15:30:00', 66, 'https://www.ticketswap.hu/theatre-tickets/marika-for-prezident-specziell-rainer-micsinyei-nora-onallo-estje-budapest-corvin-dumaszinhaz-2026-06-20-CYMbG7Arvfbx3kTHRhHJk', 0, NULL, NULL),
(128, 'official', 'MOMKult, Budapest', 'Színház', 'Inkognitó – Interaktív játék show', '2026-06-14 13:00:00', 44, 'https://www.ticketswap.hu/theatre-tickets/inkognito-interaktiv-jatek-show-budapest-momkult-2026-06-14-CZSQUjoZFEgzuGfL4R1dp', 0, NULL, NULL),
(129, 'official', 'Pesti Magyar Színház, Budapest', 'Színház', 'VÁMPÍROK BÁLJA musical', '2026-07-03 15:00:00', 45, 'https://www.ticketswap.hu/theatre-tickets/vampirok-balja-musical-budapest-pesti-magyar-szinhaz-2026-07-03-CTuWHSsFts33WF7osBN2Z', 0, NULL, NULL),
(130, 'official', 'Magyar Állami Operaház / Hungarian State Opera, Budapest', 'Színház', 'Macbeth', '2026-06-12 14:30:00', 42, 'https://www.ticketswap.hu/theatre-tickets/macbeth-budapest-magyar-allami-operahaz-hungarian-state-opera-2026-06-12-3Mz3apSf9msd4TuLAxG8me', 0, NULL, NULL),
(131, 'official', 'Madách Színház, Budapest', 'Színház', 'Jégvarázs', '2026-06-21 11:00:00', 43, 'https://www.ticketswap.hu/theatre-tickets/jegvarazs-budapest-madach-szinhaz-2026-06-21-CY2fEM9L3dtwZnEXVJNqu', 0, NULL, NULL),
(132, 'official', 'Magyar Állami Operaház / Hungarian State Opera, Budapest', 'Színház', 'A diótörő', '2026-12-22 16:00:00', 42, 'https://www.ticketswap.hu/theatre-tickets/a-diotoro-budapest-magyar-allami-operahaz-hungarian-state-opera-2026-12-22-CYp6poNgwDrKrPFKi7opv', 0, NULL, NULL),
(133, 'official', 'Erkel Színház, Budapest', 'Színház', 'Hogyan tudnék élni nélküled?', '2026-09-13 11:00:00', 40, 'https://www.ticketswap.hu/theatre-tickets/hogyan-tudnek-elni-nelkuled-budapest-erkel-szinhaz-2026-09-13-CYv2eN2yeUCdrD3zzhr6y', 0, NULL, NULL),
(134, 'official', 'Átrium Színház, Budapest', 'Színház', 'Innen már csak gurulunk - Bödőcs Tibor önálló estj', '2026-06-07 16:00:00', 65, 'https://www.ticketswap.hu/theatre-tickets/innen-mar-csak-gurulunk-bodocs-tibor-onallo-estje-elozenekar-toth-edu-budapest-atrium-szinhaz-2026-06-07-CWCeJhCvU71c9As3hZpWF', 0, NULL, NULL),
(135, 'official', 'Madách Színház, Budapest', 'Színház', 'Mamma Mia!', '2026-06-27 11:00:00', 43, 'https://www.ticketswap.hu/theatre-tickets/mamma-mia-budapest-madach-szinhaz-2026-06-27-CY2fFKHzcDtjUqoXFCsjN', 0, NULL, NULL),
(136, 'official', 'Erkel Színház, Budapest', 'Színház', 'ELISABETH', '2026-10-03 11:00:00', 40, 'https://www.ticketswap.hu/theatre-tickets/elisabeth-budapest-erkel-szinhaz-2026-10-03-CZ3MCPYmm83hkfD235jsQ', 0, NULL, NULL),
(137, 'official', 'Erkel Színház, Budapest', 'Színház', 'Hogyan tudnék élni nélküled?', '2026-09-11 15:00:00', 40, 'https://www.ticketswap.hu/theatre-tickets/hogyan-tudnek-elni-nelkuled-budapest-erkel-szinhaz-2026-09-11-CYwN8TGzDjbH1KAB3X7VJ', 0, NULL, NULL),
(138, 'official', 'Papp László Budapest SportAréna, Budapest', 'Komédia', 'GABRIEL IGLESIAS THE 1976 TOUR', '2026-06-10 16:00:00', 6, 'https://www.ticketswap.hu/comedy-show-tickets/gabriel-iglesias-the-1976-tour-budapest-papp-laszlo-budapest-sportarena-2026-06-10-CW4S5puz4c5apNjV71MAV', 0, NULL, NULL),
(139, 'official', 'UP Rendezvénytér, Budapest', 'Komédia', 'Innen már csak gurulunk - Bödőcs Tibor önálló estj', '2026-10-04 14:00:00', 23, 'https://www.ticketswap.hu/comedy-show-tickets/innen-mar-csak-gurulunk-bodocs-tibor-onallo-estje-elozenekar-toth-edu-budapest-up-rendezvenyter-2026-10-04-CYFrUGcwhDYmCywbAKFiH', 0, NULL, NULL),
(140, 'official', 'UP Rendezvénytér, Budapest', 'Komédia', 'Innen már csak gurulunk - Bödőcs Tibor önálló estj', '2026-10-04 16:30:00', 23, 'https://www.ticketswap.hu/comedy-show-tickets/innen-mar-csak-gurulunk-bodocs-tibor-onallo-estje-elozenekar-toth-edu-budapest-up-rendezvenyter-2026-10-04-CYFv3WCHAhLbKz3ouxfLZ', 0, NULL, NULL),
(141, 'official', 'Csepeli Munkásotthon / Csepel Színház, Budapest', 'Komédia', 'Innen már csak gurulunk - Bödőcs Tibor önálló estj', '2026-09-02 14:00:00', 67, 'https://www.ticketswap.hu/comedy-show-tickets/innen-mar-csak-gurulunk-bodocs-tibor-onallo-estje-elozenekar-toth-edu-budapest-csepeli-munkasotthon-csepel-szinhaz-2026-09-02-CYYEpodvnK7soWyCzrzaS', 0, NULL, NULL),
(142, 'official', 'Városmajori Szabadtéri Színpad, Budapest', 'Komédia', 'Steigervald Krisztián- Generációs különbségek', '2026-06-23 16:00:00', 46, 'https://www.ticketswap.hu/comedy-show-tickets/steigervald-krisztian-generacios-kulonbsegek-budapest-varosmajori-szabadteri-szinpad-2026-06-23-CYwgS1iwW64S656stHwb2', 0, NULL, NULL),
(143, 'official', 'Hamvas Béla Pest Megyei Könyvtár, Szentendre', 'Komédia', 'A digitális nindzsa - Aranyosi Péter önálló estje', '2026-06-05 14:00:00', 47, 'https://www.ticketswap.hu/comedy-show-tickets/a-digitalis-nindzsa-aranyosi-peter-onallo-estje-szentendre-hamvas-bela-pest-megyei-konyvtar-2026-06-05-CVHdYBFviksY7aTAuVvfe', 0, NULL, NULL),
(144, 'official', 'Eötvös10 Közösségi és Kulturális Színtér, Budapest', 'Komédia', 'Babusgató', '2026-06-02 13:00:00', 48, 'https://www.ticketswap.hu/comedy-show-tickets/babusgato-budapest-eotvos10-kozossegi-es-kulturalis-szinter-2026-06-02-CVqpkY2aQaiMRqGrEb8L1', 0, NULL, NULL),
(145, 'official', 'Papp László Budapest SportAréna, Budapest', 'Komédia', 'ÁTTÖRÉS - \'Teremtsd újra Önmagad!\'', '2026-12-20 11:00:00', 6, 'https://www.ticketswap.hu/comedy-show-tickets/attores-teremtsd-ujra-onmagad-budapest-papp-laszlo-budapest-sportarena-2026-12-20-CY2fH9tzVPfhPM9EMUV7H', 0, NULL, NULL),
(146, 'official', 'VOKE József Attila Művelődési Központ, Dunakeszi', 'Komédia', 'A digitális nindzsa - Aranyosi Péter önálló estje', '2026-09-08 15:00:00', 49, 'https://www.ticketswap.hu/comedy-show-tickets/a-digitalis-nindzsa-aranyosi-peter-onallo-estje-dunakeszi-voke-jozsef-attila-muvelodesi-kozpont-2026-09-08-CY2fTgcDxQZXBXwMswi2H', 0, NULL, NULL),
(147, 'official', 'Mixát Udvar, Budapest', 'Komédia', 'English Stand-Up Comedy Special with Wyatt Feegrad', '2026-06-06 16:00:00', 68, 'https://www.ticketswap.hu/comedy-show-tickets/english-stand-up-comedy-special-with-wyatt-feegrado-budapest-mixat-udvar-2026-06-06-CYUkiUPsFqMozHYWusq69', 0, NULL, NULL),
(148, 'official', 'Óbudai Danubia Nonprofit Kft., Budapest', 'Komédia', 'Brácsásvicc', '2026-07-04 06:00:00', 50, 'https://www.ticketswap.hu/comedy-show-tickets/bracsasvicc-budapest-obudai-danubia-nonprofit-kft-2026-07-04-CYp7CHFKCujDxuwc8WqMP', 0, NULL, NULL),
(149, 'official', 'Placc, Szigethalom', 'Komédia', 'Cucur és Macur stand up', '2026-07-05 16:00:00', 51, 'https://www.ticketswap.hu/comedy-show-tickets/cucur-es-macur-stand-up-szigethalom-placc-2026-07-05-CYp7CRNU75jpydaZ2ZUwD', 0, NULL, NULL),
(150, 'official', 'Hegyvidéki Kulturális Szalon, Budapest', 'Komédia', 'Árnyékok és színek alkotókör', '2026-06-04 13:00:00', 52, 'https://www.ticketswap.hu/comedy-show-tickets/arnyekok-es-szinek-alkotokor-budapest-hegyvideki-kulturalis-szalon-2026-06-04-CZAwSeKPyr9xXZzHcJkUB', 0, NULL, NULL),
(151, 'official', 'Uránia Nemzeti Filmszínház, Budapest', 'Komédia', 'GOYA 40: A jó főnök', '2026-06-24 15:00:00', 53, 'https://www.ticketswap.hu/comedy-show-tickets/goya-40-a-jo-fonok-budapest-urania-nemzeti-filmszinhaz-2026-06-24-CZdMNsXvHEgjrnwPHrY7W', 0, NULL, NULL),
(152, 'official', 'Lurdy Konferencia és Rendezvényközpont, Budapest', 'Komédia', 'Aki a szakítás után leszel - SHOW WORKSHOP', '2026-06-14 07:00:00', 54, 'https://www.ticketswap.hu/comedy-show-tickets/aki-a-szakitas-utan-leszel-show-workshop-budapest-lurdy-konferencia-es-rendezvenykozpont-2026-06-14-CZj39h7uirDcW6sXAjbCa', 0, NULL, NULL),
(153, 'official', 'VOKE József Attila Művelődési Központ, Dunakeszi', 'Komédia', 'Megjöttem - Lakatos László önálló estje, előzeneka', '2026-06-10 15:00:00', 49, 'https://www.ticketswap.hu/comedy-show-tickets/megjottem-lakatos-laszlo-onallo-estje-elozenekar-oliver-wolf-dunakeszi-voke-jozsef-attila-muvelodesi-kozpont-2026-06-10-CZrcT2g1Bg3LZ2LyaTypu', 0, NULL, NULL),
(154, 'official', 'Casa Pomo D\'Oro, Budapest', 'Komédia', 'Olaszul l\'enni jó: Risotto // Az olasz rizottó tit', '2026-07-05 07:00:00', 59, 'https://www.ticketswap.hu/comedy-show-tickets/olaszul-lenni-jo-risotto-az-olasz-rizotto-titka-budapest-casa-pomo-doro-2026-07-05-CZwx9Ca9sdJ75i2zqZeCe', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `event_invites`
--

CREATE TABLE `event_invites` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `expires_at` datetime NOT NULL,
  `max_capacity` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `uses` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `event_participants`
--

CREATE TABLE `event_participants` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `is_private` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `locations`
--

INSERT INTO `locations` (`id`, `name`, `latitude`, `longitude`, `is_private`, `created_by`) VALUES
(1, 'Puskás Aréna', 47.50310900, 19.09805090, 0, NULL),
(2, 'Budapest Park', 47.46756320, 19.07761030, 0, NULL),
(3, 'MVM Dome - Budapesti Multifunkcionális Sportcsarnok', 47.48138960, 19.14577230, 0, NULL),
(4, 'Sziget Festival Official', 47.48138960, 19.14577230, 0, NULL),
(5, 'Vajdahunyad Vára', 47.51535490, 19.08187530, 0, NULL),
(6, 'Papp László Budapest SportAréna', 47.50202890, 19.10537320, 0, NULL),
(7, 'Városligeti Műjégpálya', 47.51501310, 19.08035110, 0, NULL),
(8, 'Barba Negra', 47.44139720, 19.07509840, 0, NULL),
(9, 'Óbuda Bay', 47.54919320, 19.04591060, 0, NULL),
(10, 'Akvárium Klub', 47.49867470, 19.05416210, 0, NULL),
(11, 'Müpa', 47.46964390, 19.07163190, 0, NULL),
(12, 'Millenáris', 47.51138860, 19.02490630, 0, NULL),
(13, 'Kamaraerdei Ifjúsági Park ', 47.44121250, 18.98233670, 0, NULL),
(14, 'Városháza park', 47.49665250, 19.05563340, 0, NULL),
(15, 'Magyar Vasúttörténeti Park', 47.54107170, 19.09699170, 0, NULL),
(16, 'Hungexpo', 47.49370380, 19.12664480, 0, NULL),
(17, 'Hungexpo A pavilon', 47.48138960, 19.14577230, 0, NULL),
(18, 'CEU Auditorium', 47.44933270, 19.14411960, 0, NULL),
(19, 'Margitszigeti Szabadtéri Színpad', 47.48138960, 19.14577230, 0, NULL),
(20, 'Milleraris Üvegcsarnok', 47.48138960, 19.14577230, 0, NULL),
(21, 'Hungária Koncert Kft', 47.48138960, 19.14577230, 0, NULL),
(22, 'Széchenyi Thermal Bath', 47.51843540, 19.08252230, 0, NULL),
(23, 'UP Rendezvénytér', 47.56286540, 19.08670530, 0, NULL),
(24, 'Bálna', 47.48363960, 19.06084080, 0, NULL),
(25, 'Dürer Kert', 47.45995820, 19.05748130, 0, NULL),
(26, 'Palazzo Permanens', 47.50107110, 19.06593150, 0, NULL),
(27, 'Millennium Kávéház és Étterem', 47.48138960, 19.14577230, 0, NULL),
(28, 'JOZSOO alkotóműhely', 47.48138960, 19.14577230, 0, NULL),
(29, 'HUNGEXPO Kongresszusi Központ', 47.48138960, 19.14577230, 0, NULL),
(30, 'Etyeki Kúria Borgazdaság Winery', 47.44488130, 18.75046650, 0, NULL),
(31, 'Wiking Yacht Club - Marina Part', 47.54480870, 19.06441880, 0, NULL),
(32, 'Dömörkapu Rengeteg', 47.69333910, 19.00556980, 0, NULL),
(33, 'Hungaroring', 47.58264900, 19.25002360, 0, NULL),
(34, 'Top Padel Club', 47.48138960, 19.14577230, 0, NULL),
(35, 'Budapest', 47.49787890, 19.04023830, 0, NULL),
(36, 'SUP Budapest', 47.51842970, 19.07594650, 0, NULL),
(37, 'Kelenvölgyi Közösségi Ház', 47.45127020, 19.01969410, 0, NULL),
(38, 'Magyar Testnevelési és Sporttudományi Egyetem', 47.49243850, 19.02556430, 0, NULL),
(39, 'Klauzál Gábor Művelődési Központ', 47.40891470, 19.02154090, 0, NULL),
(40, 'Erkel Színház', 47.49678130, 19.07694630, 0, NULL),
(41, 'Vígszínház', 47.51260520, 19.05142850, 0, NULL),
(42, 'Magyar Állami Operaház / Hungarian State Opera', 47.48138960, 19.14577230, 0, NULL),
(43, 'Madách Színház', 47.50129780, 19.06867100, 0, NULL),
(44, 'MOMKult', 47.49004480, 19.01846700, 0, NULL),
(45, 'Pesti Magyar Színház', 47.50330420, 19.07279100, 0, NULL),
(46, 'Városmajori Szabadtéri Színpad', 47.50680320, 19.01972510, 0, NULL),
(47, 'Hamvas Béla Pest Megyei Könyvtár', 47.66983280, 19.07512940, 0, NULL),
(48, 'Eötvös10 Közösségi és Kulturális Színtér', 47.48138960, 19.14577230, 0, NULL),
(49, 'VOKE József Attila Művelődési Központ', 47.64534400, 19.13283980, 0, NULL),
(50, 'Óbudai Danubia Nonprofit Kft.', 47.48138960, 19.14577230, 0, NULL),
(51, 'Placc', 47.30880780, 19.00917870, 0, NULL),
(52, 'Hegyvidéki Kulturális Szalon', 47.49204450, 19.01585950, 0, NULL),
(53, 'Uránia Nemzeti Filmszínház', 47.49528220, 19.06508640, 0, NULL),
(54, 'Lurdy Konferencia és Rendezvényközpont', 47.48138960, 19.14577230, 0, NULL),
(55, 'Arzenál', 47.44753200, 19.09205420, 0, NULL),
(56, 'Öreg Tölgy Kastély-Fogadó', 47.40435110, 18.78758000, 0, NULL),
(57, 'BMC - Budapest Music Center', 47.48138960, 19.14577230, 0, NULL),
(58, 'Kelenföldi pályaudvar', 47.48138960, 19.14577230, 0, NULL),
(59, 'Casa Pomo D\'Oro', 47.48138960, 19.14577230, 0, NULL),
(60, 'Óbudai Társaskör', 47.53833800, 19.04312520, 0, NULL),
(61, 'Érd Főtér', 47.37785460, 18.92096760, 0, NULL),
(62, 'Nemzeti Atlétikai Központ', 47.46307250, 19.06861330, 0, NULL),
(63, 'Off Kultur', 47.48138960, 19.14577230, 0, NULL),
(64, 'Városliget Promenád', 47.48138960, 19.14577230, 0, NULL),
(65, 'Átrium Színház', 47.51107570, 19.03098110, 0, NULL),
(66, 'Corvin Dumaszínház', 47.48138960, 19.14577230, 0, NULL),
(67, 'Csepeli Munkásotthon / Csepel Színház', 47.48138960, 19.14577230, 0, NULL),
(68, 'Mixát Udvar', 47.49015930, 19.06764380, 0, NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `full_name`, `creation_date`, `password_reset_token`, `password_reset_expires`) VALUES
(1, 'admin', 'admin@gmail.com', '$2b$10$D1HKMzMp5mCOOItebqrLHuygqoh09y73T9bbhtZuoK8QnFBIQh0jW', 'admin', 'Admin User', '2026-05-04 21:47:30', NULL, NULL),
(2, 'Proba Peter', 'proba@gmail.com', '$2b$10$ZuE1osyQD3lFoXT.C0xoE..5kOYOLshEg1JwwyzvO.jdR.7Uj5N36', 'szervezo', 'Proba Peter', '2026-05-04 21:47:30', NULL, NULL),
(3, 'patrik', 'gallaipatrik@gmail.com', '$2b$10$uq1R5ct3JaauvKX61qD4Wu9IwCjKOlKHrqqMYUK3fSPZqH703dmVO', 'user', 'Gallai Patrik', '2026-05-04 21:47:30', NULL, NULL),
(4, 'johndoe', 'johndoe@gmail.com', '$2b$10$71ofm1RGtIHBMP3hG1fJ7u5GFTwAVog89Y7JQOvIdUq7jMRanql2.', 'user', 'John Doe', '2026-05-04 21:47:30', NULL, NULL);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `location_id` (`location_id`);

--
-- A tábla indexei `event_invites`
--
ALTER TABLE `event_invites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `event_id` (`event_id`);

--
-- A tábla indexei `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT a táblához `event_invites`
--
ALTER TABLE `event_invites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);

--
-- Megkötések a táblához `event_invites`
--
ALTER TABLE `event_invites`
  ADD CONSTRAINT `event_invites_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `event_invites_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

--
-- Megkötések a táblához `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
