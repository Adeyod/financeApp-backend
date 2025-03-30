--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    account_number character varying(10) NOT NULL,
    balance numeric(15,2) DEFAULT 0.00,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.accounts OWNER TO fintech_app_owner;

--
-- Name: banks; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.banks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    bank_id integer,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    longcode character varying(255),
    pay_with_bank boolean DEFAULT false,
    supports_transfer boolean DEFAULT false,
    active boolean DEFAULT true,
    country character varying(255) NOT NULL,
    currency character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    is_deleted boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.banks OWNER TO fintech_app_owner;

--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO fintech_app_owner;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: fintech_app_owner
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_id_seq OWNER TO fintech_app_owner;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fintech_app_owner
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO fintech_app_owner;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: fintech_app_owner
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNER TO fintech_app_owner;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fintech_app_owner
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: kyc_verifications; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.kyc_verifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    id_card jsonb NOT NULL,
    utility_bill jsonb NOT NULL,
    face_verification jsonb NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rejected_reason character varying(255),
    CONSTRAINT kyc_verifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))
);


ALTER TABLE public.kyc_verifications OWNER TO fintech_app_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    message character varying(255) NOT NULL,
    user_id uuid NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    receiver uuid,
    is_viewed boolean DEFAULT false
);


ALTER TABLE public.notifications OWNER TO fintech_app_owner;

--
-- Name: otps; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.otps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    otp character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    is_used boolean DEFAULT false,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.otps OWNER TO fintech_app_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    amount numeric(15,2) NOT NULL,
    transaction_type text NOT NULL,
    transaction_date date DEFAULT CURRENT_TIMESTAMP,
    transaction_status text DEFAULT 'pending'::text,
    description character varying(255),
    account_id uuid,
    reference_number character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaction_source character varying(50),
    receiving_account uuid,
    account_number character varying(255) NOT NULL,
    receiving_account_number character varying(255),
    receiving_bank_name character varying(255),
    receiver_account_name character varying(255),
    sender_account_number character varying(255),
    sender_account_name character varying(255),
    sender_bank_name character varying(255),
    receiver_user_id uuid,
    CONSTRAINT transactions_transaction_status_check CHECK ((transaction_status = ANY (ARRAY['pending'::text, 'completed'::text]))),
    CONSTRAINT transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['credit'::text, 'debit'::text])))
);


ALTER TABLE public.transactions OWNER TO fintech_app_owner;

--
-- Name: transfers; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.transfers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    from_account_id uuid,
    to_account_id uuid,
    amount numeric(15,2) NOT NULL,
    transfer_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transfers OWNER TO fintech_app_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    user_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    password text NOT NULL,
    phone_number character varying(255),
    two_fa_enabled boolean DEFAULT false,
    biometric_enabled boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    is_updated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_phone_verified boolean DEFAULT false,
    profile_image jsonb,
    account_tier text DEFAULT 'basic'::text,
    role text DEFAULT 'customer'::text,
    CONSTRAINT users_account_tier_check CHECK ((account_tier = ANY (ARRAY['basic'::text, 'standard'::text]))),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['customer'::text, 'admin'::text, 'super_admin'::text]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY (ARRAY['active'::text, 'inactive'::text])))
);


ALTER TABLE public.users OWNER TO fintech_app_owner;

--
-- Name: verification_code; Type: TABLE; Schema: public; Owner: fintech_app_owner
--

CREATE TABLE public.verification_code (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    purpose character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verification_code OWNER TO fintech_app_owner;

--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.accounts (id, user_id, account_number, balance, is_default, created_at, updated_at) FROM stdin;
163f8aa9-f0f0-4391-a42d-fb6ef88bc9af	138875b5-9a26-4402-9e3c-6ba7afe1e040	9500268366	106000.00	t	2024-08-08 11:31:23.836924+01	2024-08-08 11:31:23.836924+01
18d966b1-4004-4d25-895e-874301363026	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	8160577675	233000.00	f	2024-10-31 17:24:20.048261+01	2024-10-31 17:24:20.048261+01
4cd159b4-9454-4434-ad46-e93bf3dbeb37	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	8060150433	190000.00	f	2024-10-03 17:39:10.417561+01	2024-10-03 17:39:10.417561+01
00deb1f2-d244-4a3e-b135-af3d52072555	bd00e5ff-7758-4d9d-9387-ca58f9bad5fa	8496197494	0.00	t	2024-11-05 12:09:00.145111+01	2024-11-05 12:09:00.145111+01
728130d4-2d65-4469-966d-174cbbd8a089	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	2527615493	7500.00	f	2024-10-31 17:25:40.18862+01	2024-10-31 17:25:40.18862+01
e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	8699751545	429500.00	t	2024-09-17 16:47:11.978324+01	2024-09-17 16:47:11.978324+01
9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	64b0fb96-3b7b-41b0-b862-306c96a68e59	6894944948	3500.00	t	2024-11-05 12:32:43.641199+01	2024-11-05 12:32:43.641199+01
513cf541-2d94-4f6f-be2c-e01b87a8d77f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	4666869543	1000000.00	f	2024-10-03 17:40:36.97103+01	2024-10-03 17:40:36.97103+01
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.banks (id, bank_id, name, slug, code, longcode, pay_with_bank, supports_transfer, active, country, currency, type, is_deleted, "createdAt", "updatedAt", created_at, updated_at) FROM stdin;
6047048c-d27f-4236-ae13-ba6646d4c011	27	ALAT by WEMA	alat-by-wema	035A	035150103	f	t	t	Nigeria	NGN	nuban	f	2017-11-15 13:21:31+01	2022-05-31 16:54:34+01	2024-10-08 06:20:11.813847+01	2024-10-08 06:20:11.813847+01
ac2d56e4-44dc-40fd-9fa8-98e8b914188c	179	Amju Unique MFB	amju-unique-mfb	50926	511080896	f	t	t	Nigeria	NGN	nuban	f	2021-07-07 14:45:57+01	2021-07-07 14:45:57+01	2024-10-08 06:20:11.817693+01	2024-10-08 06:20:11.817693+01
9c701fa6-9ae7-4637-b437-b982fecf83fc	689	AMPERSAND MICROFINANCE BANK	ampersand-microfinance-bank-ng	51341		f	t	t	Nigeria	NGN	nuban	f	2023-03-23 12:11:40+01	2023-03-23 12:11:40+01	2024-10-08 06:20:11.820477+01	2024-10-08 06:20:11.820477+01
b62fca03-1f95-4cd8-b20e-062835dd6476	795	Amucha MFB	amucha-mfb-ng	645	090645	f	t	t	Nigeria	NGN	nuban	f	2024-08-27 12:10:52+01	2024-08-27 12:10:52+01	2024-10-08 06:20:11.823393+01	2024-10-08 06:20:11.823393+01
c9ec8d65-d443-4869-bf92-4c1c73143d03	800	Amucha Microfinance Bank	amucha-microfinance-bank-ng	645	645	f	t	t	Nigeria	NGN	nuban	f	2024-10-02 12:09:08+01	2024-10-02 12:09:08+01	2024-10-08 06:20:11.826394+01	2024-10-08 06:20:11.826394+01
dac44879-fbcc-40b3-ba04-39736ec2aab6	614	Aramoko MFB	aramoko-mfb	50083		f	t	t	Nigeria	NGN	nuban	f	2022-08-10 10:48:24+01	2022-08-10 10:48:24+01	2024-10-08 06:20:11.828966+01	2024-10-08 06:20:11.828966+01
430f6c09-9689-45b3-924b-149c87fd69f8	63	ASO Savings and Loans	asosavings	401		f	t	t	Nigeria	NGN	nuban	f	2018-09-23 06:52:38+01	2019-01-30 10:38:57+01	2024-10-08 06:20:11.83141+01	2024-10-08 06:20:11.83141+01
78239be5-6439-410a-8c28-f2b884510e7b	793	Assets Microfinance Bank	assets-microfinance-bank-ng	50092	50092	f	t	t	Nigeria	NGN	nuban	f	2024-08-21 12:36:11+01	2024-08-21 12:36:11+01	2024-10-08 06:20:11.833791+01	2024-10-08 06:20:11.833791+01
277b2c73-771c-454e-8536-7751b438984e	297	Astrapolaris MFB LTD	astrapolaris-mfb	MFB50094		f	t	t	Nigeria	NGN	nuban	f	2022-05-25 11:46:17+01	2022-05-25 11:46:17+01	2024-10-08 06:20:11.836247+01	2024-10-08 06:20:11.836247+01
3d0a860a-98a4-421f-a456-96ac73b5c48b	759	AVUENEGBE MICROFINANCE BANK	avuenegbe-microfinance-bank-ng	090478	090478	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:19:20+01	2023-12-30 07:19:20+01	2024-10-08 06:20:11.838624+01	2024-10-08 06:20:11.838624+01
bd20b369-31f4-4be0-83c4-529e42885c1e	778	AWACASH MICROFINANCE BANK	awacash-microfinance-bank-ng	51351	51351	f	t	t	Nigeria	NGN	nuban	f	2024-05-20 11:27:56+01	2024-05-20 11:27:56+01	2024-10-08 06:20:11.841621+01	2024-10-08 06:20:11.841621+01
1252b011-9028-4ad7-8d7e-71133d5b08c9	796	AZTEC MICROFINANCE BANK LIMITED	aztec-microfinance-bank-limited-ng	51337	090540	f	t	t	Nigeria	NGN	nuban	f	2024-08-28 15:36:20+01	2024-08-28 15:36:20+01	2024-10-08 06:20:11.845175+01	2024-10-08 06:20:11.845175+01
e9414156-aaad-40a7-ac11-1d4d51f9ceef	181	Bainescredit MFB	bainescredit-mfb	51229		f	t	t	Nigeria	NGN	nuban	f	2021-07-12 15:41:18+01	2021-07-12 15:41:18+01	2024-10-08 06:20:11.848016+01	2024-10-08 06:20:11.848016+01
41ed56c1-2b6f-404c-a5e0-168988b9015c	686	Banc Corp Microfinance Bank	banc-corp-microfinance-bank-ng	50117	50117	f	t	t	Nigeria	NGN	nuban	f	2023-03-06 16:39:58+01	2023-03-06 16:39:58+01	2024-10-08 06:20:11.850923+01	2024-10-08 06:20:11.850923+01
1e03c25e-f8ca-4cdc-8c9c-1a613ca7f971	777	Baobab Microfinance Bank	baobab-microfinance-bank-ng	MFB50992	MFB50992	f	t	t	Nigeria	NGN	nuban	f	2024-05-08 10:06:52+01	2024-05-08 10:06:52+01	2024-10-08 06:20:11.854706+01	2024-10-08 06:20:11.854706+01
71f5351d-7b25-40cd-af48-0b4ee6d014c7	783	BellBank Microfinance Bank	bellbank-microfinance-bank-ng	51100	51100	f	t	t	Nigeria	NGN	nuban	f	2024-07-02 12:56:37+01	2024-07-02 12:56:37+01	2024-10-08 06:20:11.857602+01	2024-10-08 06:20:11.857602+01
d269ef28-30b7-4858-8fb1-f84166d82cae	589	Benysta Microfinance Bank Limited	benysta-microfinance-bank-limited	51267	51267	f	t	t	Nigeria	NGN	nuban	f	2022-07-28 15:22:56+01	2024-07-04 12:12:27+01	2024-10-08 06:20:11.860252+01	2024-10-08 06:20:11.860252+01
6f5ed138-7d33-4c61-8c28-ee32060f5171	771	Beststar Microfinance Bank	beststar-microfinance-bank-ng	50123	090615	f	t	t	Nigeria	NGN	nuban	f	2024-01-26 09:55:14+01	2024-01-26 09:55:14+01	2024-10-08 06:20:11.86362+01	2024-10-08 06:20:11.86362+01
54f8944c-2009-4b03-b59f-947508b6046d	108	Bowen Microfinance Bank	bowen-microfinance-bank	50931		f	t	t	Nigeria	NGN	nuban	f	2020-02-11 16:38:57+01	2020-02-11 16:38:57+01	2024-10-08 06:20:11.86661+01	2024-10-08 06:20:11.86661+01
0109dd13-02a2-4d18-b22c-acc76dea9ff7	697	Branch International Financial Services Limited	branch	FC40163		f	t	t	Nigeria	NGN	nuban	f	2023-05-04 10:49:07+01	2023-05-04 10:49:07+01	2024-10-08 06:20:11.869396+01	2024-10-08 06:20:11.869396+01
ca79a11c-973c-4153-b02a-91dabb6f21f3	82	Carbon	carbon	565		f	t	t	Nigeria	NGN	nuban	f	2020-06-16 09:15:31+01	2021-08-05 16:25:01+01	2024-10-08 06:20:11.87381+01	2024-10-08 06:20:11.87381+01
8951326b-fca5-4f08-be48-bdd2c0f9f147	781	Cashbridge Microfinance Bank Limited	cashbridge-mfb-ng	51353	51353	f	t	t	Nigeria	NGN	nuban	f	2024-06-27 14:01:40+01	2024-06-27 14:01:40+01	2024-10-08 06:20:11.877946+01	2024-10-08 06:20:11.877946+01
52937e0d-33a9-4099-8555-fb7632fff0bc	692	CASHCONNECT MFB	cashconnect-mfb-ng	865	865	f	t	t	Nigeria	NGN	nuban	f	2023-04-05 15:29:19+01	2023-04-05 15:29:19+01	2024-10-08 06:20:11.880656+01	2024-10-08 06:20:11.880656+01
41db7f69-38d3-423e-8067-ba21a1040cb1	302	9mobile 9Payment Service Bank	9mobile-9payment-service-bank-ng	120001	120001	f	t	t	Nigeria	NGN	nuban	f	2022-05-31 07:50:27+01	2022-06-23 10:33:55+01	2024-10-08 06:20:11.623951+01	2024-10-08 06:20:11.623951+01
aacea530-6ea1-4ac1-92b5-f74437bdd586	74	CEMCS Microfinance Bank	cemcs-microfinance-bank	50823		f	t	t	Nigeria	NGN	nuban	f	2020-03-23 16:06:13+01	2020-03-23 16:06:28+01	2024-10-08 06:20:11.883467+01	2024-10-08 06:20:11.883467+01
92c807d8-98ca-49b9-9364-63a6854b2868	284	Chanelle Microfinance Bank Limited	chanelle-microfinance-bank-limited-ng	50171	50171	f	t	t	Nigeria	NGN	nuban	f	2022-02-10 14:28:38+01	2022-02-10 14:28:38+01	2024-10-08 06:20:11.886373+01	2024-10-08 06:20:11.886373+01
463d8f5a-8a03-40b0-82fc-e63bb7010ada	704	Chikum Microfinance bank	chikum-microfinance-bank-ng	312	null	f	t	t	Nigeria	NGN	nuban	f	2023-07-03 12:21:07+01	2023-07-03 12:21:07+01	2024-10-08 06:20:11.887607+01	2024-10-08 06:20:11.887607+01
4b0cf1f9-add4-4d77-85b2-00759fe63469	2	Citibank Nigeria	citibank-nigeria	023	023150005	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 21:24:02+01	2024-10-08 06:20:11.889688+01	2024-10-08 06:20:11.889688+01
d908b773-e76c-4500-a542-5e8fa6f6898d	755	CITYCODE MORTAGE BANK	citycode-mortage-bank-ng	070027	070027	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:16:39+01	2023-12-30 07:16:39+01	2024-10-08 06:20:11.890805+01	2024-10-08 06:20:11.890805+01
d683041e-aebe-4a8b-81ee-7a79786320a0	283	Corestep MFB	corestep-mfb	50204		f	t	t	Nigeria	NGN	nuban	f	2022-02-09 15:33:06+01	2022-02-09 15:33:06+01	2024-10-08 06:20:11.894004+01	2024-10-08 06:20:11.894004+01
4a8ce956-8c47-405f-b254-6461e4a79693	691	Consumer Microfinance Bank	consumer-microfinance-bank-ng	50910	50910	f	t	t	Nigeria	NGN	nuban	f	2023-03-28 07:18:02+01	2023-03-28 07:18:02+01	2024-10-08 06:20:11.894269+01	2024-10-08 06:20:11.894269+01
ab481e7b-5b2e-45f9-9c2d-d8b70ad37d42	173	Coronation Merchant Bank	coronation-merchant-bank-ng	559		f	t	t	Nigeria	NGN	nuban	f	2020-11-24 11:25:07+01	2023-05-04 07:49:08+01	2024-10-08 06:20:11.897072+01	2024-10-08 06:20:11.897072+01
a3b81d13-127d-4a42-8d0d-cf1f6d0ea2e0	694	County Finance Limited	county-finance-limited	FC40128		f	t	t	Nigeria	NGN	nuban	f	2023-04-26 15:24:23+01	2023-04-26 15:24:23+01	2024-10-08 06:20:11.898077+01	2024-10-08 06:20:11.898077+01
57a58232-9f09-4ecc-8fc6-4326dd6dfd42	366	Crescent MFB	crescent-mfb	51297		f	t	t	Nigeria	NGN	nuban	f	2022-07-18 13:39:03+01	2022-07-18 13:39:03+01	2024-10-08 06:20:11.899845+01	2024-10-08 06:20:11.899845+01
54f30324-11e0-417d-9561-da029b3f1566	634	Crust Microfinance Bank	crust-microfinance-bank-ng	090560		f	t	t	Nigeria	NGN	nuban	f	2022-09-22 10:14:25+01	2023-12-12 16:46:28+01	2024-10-08 06:20:11.900985+01	2024-10-08 06:20:11.900985+01
4fc9bd17-c8a6-4b92-92e2-00da72be797d	738	Davenport MICROFINANCE BANK	davenport-microfinance-bank-ng	51334	51334	f	t	t	Nigeria	NGN	nuban	f	2023-11-20 14:30:56+01	2023-11-20 14:30:56+01	2024-10-08 06:20:11.902642+01	2024-10-08 06:20:11.902642+01
1a0e8ce4-03ca-43ab-bb45-91058a6b29fb	637	Dot Microfinance Bank	dot-microfinance-bank-ng	50162		f	t	t	Nigeria	NGN	nuban	f	2022-11-03 15:39:09+01	2022-11-03 15:39:09+01	2024-10-08 06:20:11.904027+01	2024-10-08 06:20:11.904027+01
2e58a423-66e3-4eed-b7ab-13e2cb01fbab	4	Ecobank Nigeria	ecobank-nigeria	050	050150010	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 21:23:53+01	2024-10-08 06:20:11.905368+01	2024-10-08 06:20:11.905368+01
5630a432-5956-46fa-8c47-d6fe718c48a0	628	Ekimogun MFB	ekimogun-mfb-ng	50263		f	t	t	Nigeria	NGN	nuban	f	2022-08-31 09:26:39+01	2022-08-31 09:26:39+01	2024-10-08 06:20:11.906483+01	2024-10-08 06:20:11.906483+01
64b7ec9e-a1ae-45da-88cb-b37e64d2f1d6	64	Ekondo Microfinance Bank	ekondo-microfinance-bank-ng	098		f	t	t	Nigeria	NGN	nuban	f	2018-09-23 06:55:06+01	2022-09-21 16:09:51+01	2024-10-08 06:20:11.907759+01	2024-10-08 06:20:11.907759+01
04ca9d59-63fd-458c-a2a7-a4673f299766	761	EXCEL FINANCE BANK	excel-finance-bank-ng	090678	090678	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:19:49+01	2023-12-30 07:19:49+01	2024-10-08 06:20:11.909056+01	2024-10-08 06:20:11.909056+01
94d957e8-6a5b-43cc-8bfb-3524d2390993	167	Eyowo	eyowo	50126		f	t	t	Nigeria	NGN	nuban	f	2020-09-07 14:52:22+01	2020-11-24 11:03:21+01	2024-10-08 06:20:11.910509+01	2024-10-08 06:20:11.910509+01
b09ae626-7c52-423e-ba4f-26dea28c76f6	677	Fairmoney Microfinance Bank	fairmoney-microfinance-bank-ng	51318		f	t	t	Nigeria	NGN	nuban	f	2022-11-15 13:33:47+01	2022-11-15 13:37:44+01	2024-10-08 06:20:11.911601+01	2024-10-08 06:20:11.911601+01
c0711700-ad9e-4d13-875e-d3b7d04e38f2	767	Fedeth MFB	fedeth-mfb-ng	50298	090482	f	t	t	Nigeria	NGN	nuban	f	2024-01-04 15:09:56+01	2024-01-04 15:09:56+01	2024-10-08 06:20:11.91314+01	2024-10-08 06:20:11.91314+01
aa93a6e2-7af9-4a90-a50b-36a8435234c1	177	Firmus MFB	firmus-mfb	51314		f	t	t	Nigeria	NGN	nuban	f	2021-06-01 16:33:26+01	2021-06-01 16:33:26+01	2024-10-08 06:20:11.917039+01	2024-10-08 06:20:11.917039+01
ca5eeb72-1da5-40a4-80d5-4a633ba49cd8	8	First City Monument Bank	first-city-monument-bank	214	214150018	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 09:06:46+01	2024-10-08 06:20:11.920685+01	2024-10-08 06:20:11.920685+01
83155b21-e707-4ab3-af7c-e955a2d9bfc9	682	FirstTrust Mortgage Bank Nigeria	firsttrust-mortgage-bank-nigeria-ng	413		f	t	t	Nigeria	NGN	nuban	f	2023-02-17 13:12:37+01	2023-06-15 17:21:12+01	2024-10-08 06:20:11.923188+01	2024-10-08 06:20:11.923188+01
cf052297-fbcb-42b9-8630-3ae66bacc251	716	FUTMINNA MICROFINANCE BANK	futminna-microfinance-bank-ng	832	832	f	t	t	Nigeria	NGN	nuban	f	2023-10-11 14:24:17+01	2023-10-11 14:24:17+01	2024-10-08 06:20:11.925646+01	2024-10-08 06:20:11.925646+01
de6846ac-4c20-4cb0-8851-18ca71a59b64	287	Gateway Mortgage Bank LTD	gateway-mortgage-bank	812		f	t	t	Nigeria	NGN	nuban	f	2022-02-24 07:04:39+01	2022-02-24 07:04:39+01	2024-10-08 06:20:11.928871+01	2024-10-08 06:20:11.928871+01
803a4d80-742e-40bc-83fc-e97f17174d1f	769	Goldman MFB	goldman-mfb-ng	090574	950356	f	t	t	Nigeria	NGN	nuban	f	2024-01-12 11:05:20+01	2024-01-12 11:05:20+01	2024-10-08 06:20:11.931976+01	2024-10-08 06:20:11.931976+01
c3d70755-32df-4a7e-bc7a-d42f3af44c51	756	GOOD SHEPHERD MICROFINANCE BANK	good-shepherd-microfinance-bank-ng	090664	090664	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:16:56+01	2023-12-30 07:16:56+01	2024-10-08 06:20:11.935639+01	2024-10-08 06:20:11.935639+01
9f044499-42ce-48a8-986f-b2695b47c952	633	Greenwich Merchant Bank	greenwich-merchant-bank-ng	562		f	t	t	Nigeria	NGN	nuban	f	2022-09-16 16:23:58+01	2022-09-16 16:23:58+01	2024-10-08 06:20:11.93901+01	2024-10-08 06:20:11.93901+01
2f6e56c6-0187-4510-a76f-5f06527f70ae	9	Guaranty Trust Bank	guaranty-trust-bank	058	058152036	t	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2023-06-22 09:50:47+01	2024-10-08 06:20:11.94243+01	2024-10-08 06:20:11.94243+01
2e008df0-8e2b-430e-b36a-bf43bbba7dff	81	Hasal Microfinance Bank	hasal-microfinance-bank	50383		f	t	t	Nigeria	NGN	nuban	f	2020-02-11 16:38:57+01	2020-02-11 16:38:57+01	2024-10-08 06:20:11.94694+01	2024-10-08 06:20:11.94694+01
63c874fb-2b70-4444-8a31-4c26605a9744	75	IBANK Microfinance Bank	IBANK-mfb	51211	090115	f	t	t	Nigeria	NGN	nuban	f	2020-04-03 10:34:35+01	2024-07-22 12:59:33+01	2024-10-08 06:20:11.949793+01	2024-10-08 06:20:11.949793+01
5c4d0845-b977-4f83-b307-368b03f90dbe	636	Ilaro Poly Microfinance Bank	ilaro-poly-microfinance-bank-ng	50442		f	t	t	Nigeria	NGN	nuban	f	2022-10-12 10:15:26+01	2022-10-12 10:15:26+01	2024-10-08 06:20:11.953562+01	2024-10-08 06:20:11.953562+01
81719ae7-1710-425a-813c-006d0dec8b27	754	IMPERIAL HOMES MORTAGE BANK	imperial-homes-mortage-bank-ng	415	100024	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 06:53:07+01	2024-02-12 16:49:56+01	2024-10-08 06:20:11.956811+01	2024-10-08 06:20:11.956811+01
b811ff08-8430-4be4-a96e-f9502e3ba362	787	ISUA MFB	isua-mfb-ng	090701	090701	f	t	t	Nigeria	NGN	nuban	f	2024-07-19 13:38:16+01	2024-07-19 13:38:16+01	2024-10-08 06:20:11.960496+01	2024-10-08 06:20:11.960496+01
c98d6137-32cf-4320-aae3-44e2a28a6c16	768	KANOPOLY MFB	kanopoly-mfb-ng	51308	090592	f	t	t	Nigeria	NGN	nuban	f	2024-01-04 15:20:38+01	2024-01-04 15:20:38+01	2024-10-08 06:20:11.96452+01	2024-10-08 06:20:11.96452+01
39a77a06-3966-437d-a9bb-38c3ae38b7c0	784	KONGAPAY (Kongapay Technologies Limited)(formerly Zinternet)	kongapay-tech-ltd	100025	100025	f	t	t	Nigeria	NGN	nuban	f	2024-07-05 14:00:17+01	2024-07-05 14:00:17+01	2024-10-08 06:20:11.967859+01	2024-10-08 06:20:11.967859+01
2735447e-27ea-4173-b454-ce23c5567573	67	Kuda Bank	kuda-bank	50211		t	t	t	Nigeria	NGN	nuban	f	2019-11-15 18:06:54+01	2023-07-19 12:26:13+01	2024-10-08 06:20:11.973082+01	2024-10-08 06:20:11.973082+01
01a6038d-718b-4a85-8375-3c56a35f9887	6	Fidelity Bank	fidelity-bank	070	070150003	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2021-08-27 10:15:29+01	2024-10-08 06:20:11.915006+01	2024-10-08 06:20:11.915006+01
ddbb0b30-992c-42f7-a569-e727b833952a	7	First Bank of Nigeria	first-bank-of-nigeria	011	011151003	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2021-03-25 15:22:52+01	2024-10-08 06:20:11.918735+01	2024-10-08 06:20:11.918735+01
8fa896bb-6789-4f12-b914-2dbe855638ad	757	FIRST ROYAL MICROFINANCE BANK	first-royal-microfinance-bank-ng	090164	090164	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:18:48+01	2023-12-30 07:18:48+01	2024-10-08 06:20:11.921735+01	2024-10-08 06:20:11.921735+01
45b08f59-41d3-4e08-aea6-5bbccb1e9059	112	FSDH Merchant Bank Limited	fsdh-merchant-bank-limited	501		f	t	t	Nigeria	NGN	nuban	f	2020-08-20 10:37:04+01	2020-11-24 11:03:22+01	2024-10-08 06:20:11.924305+01	2024-10-08 06:20:11.924305+01
fb3ce1d3-2783-46bc-9fd1-a0103fc2ec65	794	Garun Mallam MFB	garun-mallam-mfb-ng	MFB51093	MFB51093	f	t	t	Nigeria	NGN	nuban	f	2024-08-23 10:24:06+01	2024-08-23 10:24:06+01	2024-10-08 06:20:11.926853+01	2024-10-08 06:20:11.926853+01
3824cdc1-9f89-4df9-931f-c49ed0251777	70	Globus Bank	globus-bank	00103	103015001	f	t	t	Nigeria	NGN	nuban	f	2020-02-11 16:38:57+01	2020-02-11 16:38:57+01	2024-10-08 06:20:11.929892+01	2024-10-08 06:20:11.929892+01
3f0c558b-495d-43c2-9b48-f849a91eda05	183	GoMoney	gomoney	100022		f	t	t	Nigeria	NGN	nuban	f	2021-08-04 12:49:46+01	2021-11-12 14:32:14+01	2024-10-08 06:20:11.933609+01	2024-10-08 06:20:11.933609+01
ae272380-2a38-4ac2-89fb-a59e95439355	635	Goodnews Microfinance Bank	goodnews-microfinance-bank-ng	50739		f	t	t	Nigeria	NGN	nuban	f	2022-09-29 10:14:18+01	2022-10-18 15:59:07+01	2024-10-08 06:20:11.938169+01	2024-10-08 06:20:11.938169+01
a8e0a45d-f69c-4316-8e49-2d733a7fb1c3	789	GROOMING MICROFINANCE BANK	grooming-microfinance-bank-ng	51276	51276	f	t	t	Nigeria	NGN	nuban	f	2024-08-06 11:52:30+01	2024-08-06 11:52:30+01	2024-10-08 06:20:11.940908+01	2024-10-08 06:20:11.940908+01
0e5ca48c-cc7d-49dd-aef6-4873545f97d9	111	Hackman Microfinance Bank	hackman-microfinance-bank	51251		f	t	t	Nigeria	NGN	nuban	f	2020-08-20 10:32:48+01	2020-11-24 11:03:24+01	2024-10-08 06:20:11.944633+01	2024-10-08 06:20:11.944633+01
51413c78-883f-4ded-9c76-2049481941ab	301	HopePSB	hopepsb-ng	120002	120002	f	t	t	Nigeria	NGN	nuban	f	2022-05-30 15:03:18+01	2022-05-30 15:03:18+01	2024-10-08 06:20:11.948621+01	2024-10-08 06:20:11.948621+01
5ced4be4-79b3-4a92-9d54-c7a85ef0f81e	615	Ikoyi Osun MFB	ikoyi-osun-mfb	50439		f	t	t	Nigeria	NGN	nuban	f	2022-08-10 10:48:24+01	2022-08-10 10:48:24+01	2024-10-08 06:20:11.952534+01	2024-10-08 06:20:11.952534+01
f000b60c-69d2-488c-86be-eb321c713178	703	Imowo MFB	imowo-mfb-ng	50453	50453	f	t	t	Nigeria	NGN	nuban	f	2023-06-26 14:50:15+01	2023-06-26 14:50:15+01	2024-10-08 06:20:11.955631+01	2024-10-08 06:20:11.955631+01
6ccf0cda-bb37-4ef1-bd08-bfe36ce00e76	172	Infinity MFB	infinity-mfb	50457		f	t	t	Nigeria	NGN	nuban	f	2020-11-24 11:23:37+01	2020-11-24 11:23:37+01	2024-10-08 06:20:11.959544+01	2024-10-08 06:20:11.959544+01
0dc94288-5c39-48cc-a3d4-9e342752ccc4	187	Kadpoly MFB	kadpoly-mfb	50502		f	t	t	Nigeria	NGN	nuban	f	2021-09-27 12:59:42+01	2021-09-27 12:59:42+01	2024-10-08 06:20:11.962672+01	2024-10-08 06:20:11.962672+01
0a92bac8-d5b3-4b86-9835-45f0d7b4812c	11	Keystone Bank	keystone-bank	082	082150017	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 21:23:45+01	2024-10-08 06:20:11.966901+01	2024-10-08 06:20:11.966901+01
41761e41-8bd1-4b3c-b5ad-85150d4b50a5	184	Kredi Money MFB LTD	kredi-money-mfb	50200		f	t	t	Nigeria	NGN	nuban	f	2021-08-11 10:54:03+01	2021-08-11 10:54:03+01	2024-10-08 06:20:11.969838+01	2024-10-08 06:20:11.969838+01
c2225455-dc28-4984-a653-e7fadb121e0b	109	Lagos Building Investment Company Plc.	lbic-plc	90052		f	t	t	Nigeria	NGN	nuban	f	2020-08-10 16:07:44+01	2020-08-10 16:07:44+01	2024-10-08 06:20:11.973195+01	2024-10-08 06:20:11.973195+01
0a06381e-8ee1-4778-a80f-dd7ecea50030	180	Links MFB	links-mfb	50549		f	t	t	Nigeria	NGN	nuban	f	2021-07-12 15:41:18+01	2021-07-12 15:41:18+01	2024-10-08 06:20:11.979405+01	2024-10-08 06:20:11.979405+01
32638eb6-7fb4-4444-ad3c-72826c198a84	296	Living Trust Mortgage Bank	living-trust-mortgage-bank	031		f	t	t	Nigeria	NGN	nuban	f	2022-05-25 11:46:17+01	2022-05-25 11:46:17+01	2024-10-08 06:20:11.983703+01	2024-10-08 06:20:11.983703+01
c9f05cca-e827-4996-8b90-433858658fc7	753	LOMA MFB	loma-mfb-ng	50491	090620	f	t	t	Nigeria	NGN	nuban	f	2023-12-11 06:43:27+01	2023-12-11 06:43:27+01	2024-10-08 06:20:11.987294+01	2024-10-08 06:20:11.987294+01
a0d3d264-1241-4473-96ed-4f84c8dadcaf	233	Lotus Bank	lotus-bank	303		f	t	t	Nigeria	NGN	nuban	f	2021-12-06 15:39:51+01	2021-12-06 15:39:51+01	2024-10-08 06:20:11.990367+01	2024-10-08 06:20:11.990367+01
81c007a0-b0a5-4791-a92b-3c8945d6f901	764	MAINSTREET MICROFINANCE BANK	mainstreet-microfinance-bank-ng	090171	090171	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:20:20+01	2023-12-30 07:20:20+01	2024-10-08 06:20:11.994043+01	2024-10-08 06:20:11.994043+01
f5ebbf73-0361-4e84-a74d-60e88dd6d7a3	175	Mayfair MFB	mayfair-mfb	50563		f	t	t	Nigeria	NGN	nuban	f	2021-02-02 09:28:38+01	2021-02-02 09:28:38+01	2024-10-08 06:20:11.996702+01	2024-10-08 06:20:11.996702+01
8e2fb078-431a-4d7a-a0f0-6f1c9939e21c	178	Mint MFB	mint-mfb	50304		f	t	t	Nigeria	NGN	nuban	f	2021-06-01 17:07:29+01	2021-06-01 17:07:29+01	2024-10-08 06:20:12.001229+01	2024-10-08 06:20:12.001229+01
d8473b51-e977-4c6d-ad7f-f677c598ebb9	714	Money Master PSB	money-master-psb-ng	946		f	t	t	Nigeria	NGN	nuban	f	2023-09-08 15:47:32+01	2023-09-14 13:56:51+01	2024-10-08 06:20:12.004062+01	2024-10-08 06:20:12.004062+01
90906876-8ab1-4344-8356-1e8620e41a6b	688	Moniepoint MFB	moniepoint-mfb-ng	50515	null	f	t	t	Nigeria	NGN	nuban	f	2023-03-20 13:53:58+01	2023-03-20 13:53:58+01	2024-10-08 06:20:12.008038+01	2024-10-08 06:20:12.008038+01
5d551b90-7a8f-421b-b888-ed90706b1c63	303	MTN Momo PSB	mtn-momo-psb-ng	120003	120003	f	t	t	Nigeria	NGN	nuban	f	2022-05-31 07:52:07+01	2022-06-23 10:33:55+01	2024-10-08 06:20:12.011487+01	2024-10-08 06:20:12.011487+01
3509db1c-df84-4432-aab8-0ec3980d5bb3	739	MUTUAL BENEFITS MICROFINANCE BANK	mutual-benefits-microfinance-bank-ng	090190	090190	f	t	t	Nigeria	NGN	nuban	f	2023-11-21 08:41:39+01	2023-11-21 08:41:39+01	2024-10-08 06:20:12.01475+01	2024-10-08 06:20:12.01475+01
310db376-07dc-4a7a-838f-be6608733c10	758	NDCC MICROFINANCE BANK	ndcc-microfinance-bank-ng	090679	090679	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:19:06+01	2023-12-30 07:19:06+01	2024-10-08 06:20:12.017286+01	2024-10-08 06:20:12.017286+01
40dfe9aa-58d2-434c-896e-ed21b57aa43e	776	NET MICROFINANCE BANK	net-microfinance-bank-ng	51361	51361	f	t	t	Nigeria	NGN	nuban	f	2024-04-12 10:27:39+01	2024-04-12 10:27:39+01	2024-10-08 06:20:12.019886+01	2024-10-08 06:20:12.019886+01
921ffbe4-2cb0-4e8b-9961-51a629329548	774	Nigerian Navy Microfinance Bank Limited	nigerian-navy-microfinance-bank-limited-ng	51142	090263	f	t	t	Nigeria	NGN	nuban	f	2024-03-19 15:47:56+01	2024-03-19 15:47:56+01	2024-10-08 06:20:12.022614+01	2024-10-08 06:20:12.022614+01
71c5846c-c474-4d0d-93e5-0bd395a57325	715	NPF MICROFINANCE BANK	npf-microfinance-bank-ng	50629	50629	f	t	t	Nigeria	NGN	nuban	f	2023-09-12 12:57:02+01	2023-09-12 20:24:09+01	2024-10-08 06:20:12.028811+01	2024-10-08 06:20:12.028811+01
b1609d04-64ab-4c76-94eb-2e563c5310aa	171	OPay Digital Services Limited (OPay)	paycom	999992		t	t	t	Nigeria	NGN	nuban	f	2020-11-24 11:20:45+01	2024-09-19 19:40:42+01	2024-10-08 06:20:12.045966+01	2024-10-08 06:20:12.045966+01
9e8dd816-12e2-4c01-b64b-0d86436f9aad	699	Optimus Bank Limited	optimus-bank-ltd	107	00107	f	t	t	Nigeria	NGN	nuban	f	2023-05-08 09:03:03+01	2023-06-15 17:21:12+01	2024-10-08 06:20:12.049378+01	2024-10-08 06:20:12.049378+01
36f8f439-3d3e-4e91-a245-5a7ccde67416	185	Paga	paga	100002		f	t	t	Nigeria	NGN	nuban	f	2021-08-31 09:10:00+01	2021-08-31 09:10:00+01	2024-10-08 06:20:12.052076+01	2024-10-08 06:20:12.052076+01
a63ebcb0-a8be-4438-8704-8d9ad2f2df51	169	PalmPay	palmpay	999991		f	t	t	Nigeria	NGN	nuban	f	2020-11-24 10:58:37+01	2020-11-24 11:03:19+01	2024-10-08 06:20:12.055254+01	2024-10-08 06:20:12.055254+01
d167e591-97ae-4095-aec8-28736c5c37e2	26	Parallex Bank	parallex-bank	104		f	t	t	Nigeria	NGN	nuban	f	2017-03-31 14:54:29+01	2021-10-29 09:00:19+01	2024-10-08 06:20:12.05872+01	2024-10-08 06:20:12.05872+01
00f8744f-8eda-4f29-90f2-caacbf510acb	110	Parkway - ReadyCash	parkway-ready-cash	311		f	t	t	Nigeria	NGN	nuban	f	2020-08-10 16:07:44+01	2020-08-10 16:07:44+01	2024-10-08 06:20:12.061322+01	2024-10-08 06:20:12.061322+01
4072af22-ce68-4544-95a9-48eb51bd4c03	763	PATHFINDER MICROFINANCE BANK LIMITED	pathfinder-microfinance-bank-limited-ng	090680	090680	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:20:10+01	2023-12-30 07:20:10+01	2024-10-08 06:20:12.063918+01	2024-10-08 06:20:12.063918+01
5d2ad2f4-b29a-4480-aa36-36ca8f90ede1	629	Paystack-Titan	titan-paystack	100039		f	t	t	Nigeria	NGN	nuban	f	2022-09-02 09:51:15+01	2024-03-26 15:31:05+01	2024-10-08 06:20:12.066369+01	2024-10-08 06:20:12.066369+01
7db14ec1-3c32-4e10-987c-28005c77bccb	693	Peace Microfinance Bank	peace-microfinance-bank-ng	50743	50743	f	t	t	Nigeria	NGN	nuban	f	2023-04-12 17:51:04+01	2023-04-12 17:51:04+01	2024-10-08 06:20:12.069403+01	2024-10-08 06:20:12.069403+01
8ec9afd5-e56d-4f3c-975b-e003b3027d33	775	PECANTRUST MICROFINANCE BANK LIMITED	pecantrust-microfinance-bank-limited-ng	51226	51226	f	t	t	Nigeria	NGN	nuban	f	2024-04-05 11:24:20+01	2024-04-05 11:24:20+01	2024-10-08 06:20:12.072079+01	2024-10-08 06:20:12.072079+01
d72d2658-2dcf-45e1-b535-ffa057553072	683	Personal Trust MFB	personal-trust-mfb-ng	51146		f	t	t	Nigeria	NGN	nuban	f	2023-02-17 13:13:28+01	2023-02-17 13:13:28+01	2024-10-08 06:20:12.074574+01	2024-10-08 06:20:12.074574+01
2603aa97-08b9-443d-a26e-76a46ddbdfde	170	Petra Mircofinance Bank Plc	petra-microfinance-bank-plc	50746		f	t	t	Nigeria	NGN	nuban	f	2020-11-24 11:03:06+01	2020-11-24 11:03:06+01	2024-10-08 06:20:12.077201+01	2024-10-08 06:20:12.077201+01
138e78d0-faaf-4ed2-bf32-f0da9bfd0f08	762	PFI FINANCE COMPANY LIMITED	pfi-finance-company-limited-ng	050021	050021	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:20:00+01	2023-12-30 07:20:00+01	2024-10-08 06:20:12.07967+01	2024-10-08 06:20:12.07967+01
38af72ce-c732-43c3-acf9-81ba38f5cc0f	174	Abbey Mortgage Bank	abbey-mortgage-bank-ng	404		f	t	t	Nigeria	NGN	nuban	f	2020-12-07 17:19:09+01	2023-09-14 14:02:38+01	2024-10-08 06:20:11.679729+01	2024-10-08 06:20:11.679729+01
42287062-7180-4f00-9262-87cae47caeaf	705	Platinum Mortgage Bank	platinum-mortgage-bank-ng	268	null	f	t	t	Nigeria	NGN	nuban	f	2023-07-03 12:21:22+01	2023-07-03 12:21:22+01	2024-10-08 06:20:12.082154+01	2024-10-08 06:20:12.082154+01
1ee0e028-bf99-49aa-b4ec-512a0f47105d	770	Pocket App	pocket	00716	00716	t	f	t	Nigeria	NGN	nuban	f	2024-01-18 17:56:20+01	2024-10-02 08:43:34+01	2024-10-08 06:20:12.084525+01	2024-10-08 06:20:12.084525+01
96aa20ab-be14-47b7-a44d-4ee338f44aa0	13	Polaris Bank	polaris-bank	076	076151006	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2016-07-14 11:04:29+01	2024-10-08 06:20:12.085492+01	2024-10-08 06:20:12.085492+01
32b340ba-fbb7-4b7e-bb04-0d9a0ccef69a	626	Polyunwana MFB	polyunwana-mfb-ng	50864	null	f	t	t	Nigeria	NGN	nuban	f	2022-08-17 18:27:23+01	2022-08-17 18:27:23+01	2024-10-08 06:20:12.087849+01	2024-10-08 06:20:12.087849+01
58c03cd4-1580-432c-afaf-7d104fb03483	707	Amegy Microfinance Bank	amegy-microfinance-bank-ng	090629	090629	f	t	t	Nigeria	NGN	nuban	f	2023-07-20 10:52:18+01	2023-07-20 10:52:18+01	2024-10-08 06:20:11.81661+01	2024-10-08 06:20:11.81661+01
134fe372-371f-4a3a-af83-08571cd90065	304	PremiumTrust Bank	premiumtrust-bank-ng	105	000031	f	t	t	Nigeria	NGN	nuban	f	2022-06-01 15:16:02+01	2022-08-17 09:13:08+01	2024-10-08 06:20:12.088738+01	2024-10-08 06:20:12.088738+01
1a26deca-eaaa-4e4f-b6cd-0eb7350bac6a	25	Providus Bank	providus-bank	101		f	t	t	Nigeria	NGN	nuban	f	2017-03-27 17:09:29+01	2021-02-09 18:50:06+01	2024-10-08 06:20:12.092058+01	2024-10-08 06:20:12.092058+01
1a3679b5-3ef0-4ab9-abfc-c88a26cda8b8	176	Rand Merchant Bank	rand-merchant-bank	502		f	t	t	Nigeria	NGN	nuban	f	2021-02-11 18:33:20+01	2021-02-11 18:33:20+01	2024-10-08 06:20:12.095506+01	2024-10-08 06:20:12.095506+01
ced535ec-9b55-4741-a7f0-e2958da2b4a8	773	REHOBOTH MICROFINANCE BANK	rehoboth-microfinance-bank-ng	50761	090463	f	t	t	Nigeria	NGN	nuban	f	2024-02-02 09:58:01+01	2024-02-02 09:58:01+01	2024-10-08 06:20:12.098403+01	2024-10-08 06:20:12.098403+01
2ecd5a91-52bb-40ad-b0a2-f456adbf02d0	679	ROCKSHIELD MICROFINANCE BANK	rockshield-microfinance-bank-ng	50767		f	t	t	Nigeria	NGN	nuban	f	2022-12-20 14:41:50+01	2022-12-20 15:27:14+01	2024-10-08 06:20:12.101479+01	2024-10-08 06:20:12.101479+01
e907b884-e42e-4b23-92f9-a4345535f737	609	Safe Haven Microfinance Bank Limited	safe-haven-microfinance-bank-limited-ng	951113		f	t	t	Nigeria	NGN	nuban	f	2022-07-28 15:22:56+01	2022-12-02 11:51:53+01	2024-10-08 06:20:12.10502+01	2024-10-08 06:20:12.10502+01
60ca4536-6c40-4f7e-b1c6-3b5561995c86	632	Shield MFB	shield-mfb-ng	50582		f	t	t	Nigeria	NGN	nuban	f	2022-09-16 16:16:47+01	2022-09-16 16:16:47+01	2024-10-08 06:20:12.108019+01	2024-10-08 06:20:12.108019+01
b81bc69e-99dc-490a-9bbf-e5474b59c729	365	Solid Rock MFB	solid-rock-mfb	50800		f	t	t	Nigeria	NGN	nuban	f	2022-06-27 11:24:28+01	2022-06-27 11:24:28+01	2024-10-08 06:20:12.111837+01	2024-10-08 06:20:12.111837+01
e7d52d98-8e95-4c62-92b7-8d786f48a64c	15	Standard Chartered Bank	standard-chartered-bank	068	068150015	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 21:23:40+01	2024-10-08 06:20:12.116609+01	2024-10-08 06:20:12.116609+01
5f1640e8-f974-47ea-9330-e262c76072bb	285	Stellas MFB	stellas-mfb	51253		f	t	t	Nigeria	NGN	nuban	f	2022-02-17 15:54:01+01	2022-02-17 15:54:01+01	2024-10-08 06:20:12.121292+01	2024-10-08 06:20:12.121292+01
f773320d-57ee-4c6e-8312-fb1c9b575220	68	TAJ Bank	taj-bank	302		f	t	t	Nigeria	NGN	nuban	f	2020-01-20 12:20:32+01	2020-01-20 12:20:32+01	2024-10-08 06:20:12.124788+01	2024-10-08 06:20:12.124788+01
41eb7fcb-fd79-4b58-9387-0d6fe5dd6e3b	788	TransPay MFB	transpay-mfb-ng	090708	090708	f	t	t	Nigeria	NGN	nuban	f	2024-07-19 13:38:48+01	2024-07-19 13:38:48+01	2024-10-08 06:20:12.129781+01	2024-10-08 06:20:12.129781+01
6d3a5ab8-355e-487f-8f4f-378a06501c55	18	United Bank For Africa	united-bank-for-africa	033	033153513	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2022-03-09 11:28:57+01	2024-10-08 06:20:12.139064+01	2024-10-08 06:20:12.139064+01
59135791-567c-4d9d-b247-1f86a20da36e	701	Waya Microfinance Bank	waya-microfinance-bank-ng	51355	51355	f	t	t	Nigeria	NGN	nuban	f	2023-05-31 16:50:49+01	2023-05-31 16:50:49+01	2024-10-08 06:20:12.143573+01	2024-10-08 06:20:12.143573+01
b1f6930e-6328-4825-8d40-38a75155fa57	760	PROSPERIS FINANCE LIMITED	prosperis-finance-limited-ng	050023	050023	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:19:33+01	2023-12-30 07:19:33+01	2024-10-08 06:20:12.091236+01	2024-10-08 06:20:12.091236+01
4374aa46-c5e1-429b-9b4e-81870201c003	232	QuickFund MFB	quickfund-mfb	51293		f	t	t	Nigeria	NGN	nuban	f	2021-10-29 09:43:35+01	2021-10-29 09:43:35+01	2024-10-08 06:20:12.093926+01	2024-10-08 06:20:12.093926+01
ab88a5a5-52c2-49fe-9a2e-ef5733f758c2	295	Refuge Mortgage Bank	refuge-mortgage-bank	90067		f	t	t	Nigeria	NGN	nuban	f	2022-05-25 11:46:17+01	2022-05-25 11:46:17+01	2024-10-08 06:20:12.097437+01	2024-10-08 06:20:12.097437+01
2f82d076-216e-4fe9-b32d-c530897533e7	700	Rigo Microfinance Bank Limited	rigo-microfinance-bank-limited-ng	51286	51286	f	t	t	Nigeria	NGN	nuban	f	2023-05-26 15:45:26+01	2023-05-26 15:45:26+01	2024-10-08 06:20:12.100379+01	2024-10-08 06:20:12.100379+01
01ff62c2-d52e-4b3d-b006-0343de00c2a8	286	Safe Haven MFB	safe-haven-mfb-ng	51113	51113	f	t	t	Nigeria	NGN	nuban	f	2022-02-18 14:11:59+01	2022-02-18 14:11:59+01	2024-10-08 06:20:12.103772+01	2024-10-08 06:20:12.103772+01
7fe6f804-f7e8-4356-8c52-c6ad7faac998	750	Signature Bank Ltd	signature-bank-ltd-ng	106	000034	f	t	t	Nigeria	NGN	nuban	f	2023-12-06 09:58:35+01	2023-12-06 09:58:35+01	2024-10-08 06:20:12.110109+01	2024-10-08 06:20:12.110109+01
fe4ad4a9-fc83-4228-a39f-dd8a198327dc	14	Stanbic IBTC Bank	stanbic-ibtc-bank	221	221159522	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 21:24:17+01	2024-10-08 06:20:12.115731+01	2024-10-08 06:20:12.115731+01
71119abf-c8e4-4cf3-864e-3a3c77f48bd3	779	STATESIDE MICROFINANCE BANK	stateside-microfinance-bank-ng	50809	50809	f	t	t	Nigeria	NGN	nuban	f	2024-05-21 11:21:20+01	2024-05-21 11:21:20+01	2024-10-08 06:20:12.120278+01	2024-10-08 06:20:12.120278+01
ef37103b-719f-4d2f-a016-a8d30f1e0f9b	631	Supreme MFB	supreme-mfb-ng	50968		f	t	t	Nigeria	NGN	nuban	f	2022-09-16 16:16:29+01	2022-09-16 16:16:29+01	2024-10-08 06:20:12.123992+01	2024-10-08 06:20:12.123992+01
4022e69b-4048-47f9-981c-b5341755f050	73	Titan Bank	titan-bank	102		f	t	t	Nigeria	NGN	nuban	f	2020-03-10 12:41:36+01	2020-03-23 16:06:29+01	2024-10-08 06:20:12.128598+01	2024-10-08 06:20:12.128598+01
52d3f7e4-6bc7-43e0-8385-6c2d81d6eacd	630	Uhuru MFB	uhuru-mfb-ng	51322		f	t	t	Nigeria	NGN	nuban	f	2022-09-14 13:58:20+01	2023-09-05 18:23:38+01	2024-10-08 06:20:12.134083+01	2024-10-08 06:20:12.134083+01
f3c1dd24-9872-4803-ac63-e681a11f6bb6	638	Unilag Microfinance Bank	unilag-microfinance-bank-ng	51316		f	t	t	Nigeria	NGN	nuban	f	2022-11-07 08:41:50+01	2022-11-07 08:41:50+01	2024-10-08 06:20:12.137008+01	2024-10-08 06:20:12.137008+01
84e5d4fe-c345-48b3-8e41-c6d4c8221240	725	Vale Finance Limited	vale-finance	050020		f	t	t	Nigeria	NGN	nuban	f	2023-10-26 15:23:46+01	2023-10-26 15:23:46+01	2024-10-08 06:20:12.141512+01	2024-10-08 06:20:12.141512+01
627016a1-a4e7-4cff-8a79-a30399709c7f	21	Zenith Bank	zenith-bank	057	057150013	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2023-09-26 18:09:43+01	2024-10-08 06:20:12.148563+01	2024-10-08 06:20:12.148563+01
4ed1421d-3e8d-4338-8e99-f9ce93de4e4b	792	Prospa Capital Microfinance Bank	prospa-capital-microfinance-bank-ng	50739	50739	f	t	t	Nigeria	NGN	nuban	f	2024-08-13 09:14:03+01	2024-08-13 09:14:03+01	2024-10-08 06:20:12.090347+01	2024-10-08 06:20:12.090347+01
5bd9b709-b71a-434b-b972-40f9322b746e	766	RANDALPHA MICROFINANCE BANK	randalpha-microfinance-bank-ng	090496	090496	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:20:40+01	2023-12-30 07:20:40+01	2024-10-08 06:20:12.096474+01	2024-10-08 06:20:12.096474+01
0a99c512-cc7a-4e3b-be82-db6de7d030e3	710	Rephidim Microfinance Bank	rephidim	50994	221151615	f	t	t	Nigeria	NGN	nuban	f	2023-08-21 09:22:46+01	2023-08-21 09:22:46+01	2024-10-08 06:20:12.099376+01	2024-10-08 06:20:12.099376+01
e5cd962a-309d-4c7c-9849-8498cf8180d8	69	Rubies MFB	rubies-mfb	125		f	t	t	Nigeria	NGN	nuban	f	2020-01-25 10:49:59+01	2020-01-25 10:49:59+01	2024-10-08 06:20:12.102623+01	2024-10-08 06:20:12.102623+01
9028a4e3-280a-4488-8085-bde1bbd013d1	706	SAGE GREY FINANCE LIMITED	sage-grey-finance-limited-ng	40165	null	f	t	t	Nigeria	NGN	nuban	f	2023-07-05 09:27:27+01	2023-07-05 09:27:27+01	2024-10-08 06:20:12.106542+01	2024-10-08 06:20:12.106542+01
7cecce0d-c2fc-4f6b-88f2-03b8d3e8f952	695	Solid Allianze MFB	solid-allianze-mfb	51062		f	t	t	Nigeria	NGN	nuban	f	2023-04-26 16:02:23+01	2023-04-26 16:02:23+01	2024-10-08 06:20:12.111046+01	2024-10-08 06:20:12.111046+01
df563115-0d61-4146-9b81-ab7869e4135e	72	Sparkle Microfinance Bank	sparkle-microfinance-bank	51310		f	t	t	Nigeria	NGN	nuban	f	2020-02-11 19:43:14+01	2020-02-11 19:43:14+01	2024-10-08 06:20:12.114934+01	2024-10-08 06:20:12.114934+01
ccd2399b-1da7-4cfb-a526-276561af7e6f	188	Above Only MFB	above-only-mfb	51204		f	t	t	Nigeria	NGN	nuban	f	2021-10-13 21:35:17+01	2021-10-13 21:35:17+01	2024-10-08 06:20:11.692453+01	2024-10-08 06:20:11.692453+01
10c58959-ac0f-49d6-9136-544f6762422d	765	STANFORD MICROFINANCE BANK	stanford-microfinance-bank-ng	090162	090162	f	t	t	Nigeria	NGN	nuban	f	2023-12-30 07:20:30+01	2023-12-30 07:20:30+01	2024-10-08 06:20:12.119221+01	2024-10-08 06:20:12.119221+01
ec31fc5e-05c2-44a7-830b-1ec64e4abf44	16	Sterling Bank	sterling-bank	232	232150016	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2022-05-27 09:56:01+01	2024-10-08 06:20:12.122194+01	2024-10-08 06:20:12.122194+01
de89c4dc-c381-4346-991b-a4e89c252bad	3	Access Bank (Diamond)	access-bank-diamond	063	063150162	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 09:06:48+01	2024-10-08 06:20:11.729202+01	2024-10-08 06:20:11.729202+01
d3e307ee-d5bd-4d0c-8238-114a21635fb7	23	Suntrust Bank	suntrust-bank	100		f	t	t	Nigeria	NGN	nuban	f	2016-10-10 18:26:29+01	2016-10-10 18:26:29+01	2024-10-08 06:20:12.123073+01	2024-10-08 06:20:12.123073+01
a1f1710b-3168-4ff3-8899-6d0cf18287a1	186	Tangerine Money	tangerine-money	51269		f	t	t	Nigeria	NGN	nuban	f	2021-09-17 14:25:16+01	2021-09-17 14:25:16+01	2024-10-08 06:20:12.125687+01	2024-10-08 06:20:12.125687+01
5637d748-889b-4352-91e9-e04543d4ad2c	790	The Alternative bank	the-alternative-bank-ng	000304	000304	f	t	t	Nigeria	NGN	nuban	f	2024-08-06 13:31:06+01	2024-08-06 13:31:06+01	2024-10-08 06:20:12.127785+01	2024-10-08 06:20:12.127785+01
724b66f3-dc6e-4421-846c-50f8bc8b1e77	690	U&C Microfinance Bank Ltd (U AND C MFB)	uc-microfinance-bank-ltd-u-and-c-mfb-ng	50840	50840	f	t	t	Nigeria	NGN	nuban	f	2023-03-27 17:55:53+01	2023-03-27 17:55:53+01	2024-10-08 06:20:12.132054+01	2024-10-08 06:20:12.132054+01
9750cd4e-a92b-4cba-862f-f924fd246281	786	UCEE MFB	ucee-mfb-ng	090706	090706	f	t	t	Nigeria	NGN	nuban	f	2024-07-19 13:37:46+01	2024-07-19 13:37:46+01	2024-10-08 06:20:12.133272+01	2024-10-08 06:20:12.133272+01
95416f3f-225d-4ffb-8dd0-38a5ebd5fe0a	678	Unaab Microfinance Bank Limited	unaab-microfinance-bank-limited-ng	50870		f	t	t	Nigeria	NGN	nuban	f	2022-11-24 14:47:10+01	2022-11-24 14:49:16+01	2024-10-08 06:20:12.135161+01	2024-10-08 06:20:12.135161+01
3bd21ed2-c77f-426b-9395-77b781cbaa2e	282	Unical MFB	unical-mfb	50871		f	t	t	Nigeria	NGN	nuban	f	2022-01-10 10:52:47+01	2022-01-10 10:52:47+01	2024-10-08 06:20:12.136117+01	2024-10-08 06:20:12.136117+01
ea18aa53-4a00-4456-8e81-5cbcacacc75f	17	Union Bank of Nigeria	union-bank-of-nigeria	032	032080474	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 21:22:54+01	2024-10-08 06:20:12.138187+01	2024-10-08 06:20:12.138187+01
bd618a92-d51f-4a31-b60a-f68ee8463d7f	19	Unity Bank	unity-bank	215	215154097	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2019-07-22 13:44:02+01	2024-10-08 06:20:12.13979+01	2024-10-08 06:20:12.13979+01
021fa12b-f352-48e1-92a3-d86e332672e8	737	Uzondu Microfinance Bank Awka Anambra State	uzondu-microfinance-bank-awka-anambra-state-ng	50894	50894	f	t	t	Nigeria	NGN	nuban	f	2023-10-31 14:19:39+01	2023-10-31 14:19:39+01	2024-10-08 06:20:12.140611+01	2024-10-08 06:20:12.140611+01
bc8c83b0-3238-425b-a1d2-821b5a3f2acf	71	VFD Microfinance Bank Limited	vfd	566		f	t	t	Nigeria	NGN	nuban	f	2020-02-11 16:44:11+01	2020-10-28 10:42:08+01	2024-10-08 06:20:12.142707+01	2024-10-08 06:20:12.142707+01
b0c5c52f-e1dd-44cc-a0af-8c858c22b8c8	20	Wema Bank	wema-bank	035	035150103	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2021-02-09 18:49:59+01	2024-10-08 06:20:12.144497+01	2024-10-08 06:20:12.144497+01
08a89710-1782-4c62-8f77-08fce0302441	797	Yes MFB	yes-mfb-ng	594	090142	f	t	t	Nigeria	NGN	nuban	f	2024-09-11 15:31:38+01	2024-09-11 15:31:38+01	2024-10-08 06:20:12.146147+01	2024-10-08 06:20:12.146147+01
6d314bff-1b93-4f69-b5dc-ac641be700b2	627	Abulesoro MFB	abulesoro-mfb-ng	51312		f	t	t	Nigeria	NGN	nuban	f	2022-08-31 09:26:20+01	2022-08-31 09:26:20+01	2024-10-08 06:20:11.713093+01	2024-10-08 06:20:11.713093+01
676248c4-942d-452a-af0a-34cf90bb6648	495	Accion Microfinance Bank	accion-microfinance-bank-ng	602		f	t	t	Nigeria	NGN	nuban	f	2022-07-28 15:22:56+01	2022-09-19 08:48:37+01	2024-10-08 06:20:11.764045+01	2024-10-08 06:20:11.764045+01
fc28265c-657e-4e4d-a77f-80a219833aba	22	Jaiz Bank	jaiz-bank	301	301080020	f	t	t	Nigeria	NGN	nuban	f	2016-10-10 18:26:29+01	2016-10-10 18:26:29+01	2024-10-08 06:20:11.961619+01	2024-10-08 06:20:11.961619+01
10b8b306-5daa-4d34-b533-03f2ecb8de97	168	Ibile Microfinance Bank	ibile-mfb	51244		f	t	t	Nigeria	NGN	nuban	f	2020-10-21 11:54:20+01	2020-10-21 11:54:33+01	2024-10-08 06:20:11.950911+01	2024-10-08 06:20:11.950911+01
d5426564-68d0-4533-916b-9b24e02bf8e2	780	AG Mortgage Bank	ag-mortgage-bank-ng	90077	100028	f	t	t	Nigeria	NGN	nuban	f	2024-06-07 14:28:00+01	2024-06-07 14:28:00+01	2024-10-08 11:21:42.063444+01	2024-10-08 11:21:42.063444+01
d4a8c18b-fc95-4ac1-8501-fe0c092c0325	300	Airtel Smartcash PSB	airtel-smartcash-psb-ng	120004	120004	f	t	t	Nigeria	NGN	nuban	f	2022-05-30 15:03:00+01	2022-05-31 07:58:22+01	2024-10-08 11:21:42.065583+01	2024-10-08 11:21:42.065583+01
a3d6dcf9-dd52-4c90-8802-c8819e0c93a5	1	Access Bank	access-bank	044	044150149	f	t	t	Nigeria	NGN	nuban	f	2016-07-14 11:04:29+01	2020-02-18 09:06:44+01	2024-10-08 11:21:42.057013+01	2024-10-08 11:21:42.057013+01
26932fa0-353e-49ed-90bc-c2eab0c8afb5	676	Ahmadu Bello University Microfinance Bank	ahmadu-bello-university-microfinance-bank-ng	50036		f	t	t	Nigeria	NGN	nuban	f	2022-11-14 14:35:42+01	2022-11-14 14:35:42+01	2024-10-08 11:21:42.058479+01	2024-10-08 11:21:42.058479+01
41fd15f1-8100-4526-9e2a-2eaf82368e6d	687	Aella MFB	aella-mfb-ng	50315	50315	f	t	t	Nigeria	NGN	nuban	f	2023-03-09 09:11:06+01	2024-07-30 11:51:33+01	2024-10-08 11:21:42.059644+01	2024-10-08 11:21:42.059644+01
38834018-976c-4a20-8d53-706302e5069b	497	Akuchukwu Microfinance Bank Limited	akuchukwu-microfinance-bank-limited-ng	090561	090561	f	t	t	Nigeria	NGN	nuban	f	2022-07-28 15:22:56+01	2023-11-03 13:09:37+01	2024-10-08 11:21:42.084695+01	2024-10-08 11:21:42.084695+01
ff17404a-f184-4e5f-84bc-bde989e9d6ff	698	AKU Microfinance Bank	aku-mfb	51336		f	t	t	Nigeria	NGN	nuban	f	2023-05-04 16:12:34+01	2023-05-04 16:12:34+01	2024-10-08 11:21:42.074842+01	2024-10-08 11:21:42.074842+01
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
8	20240729151117_users_and_accounts_and_verification_code.ts	1	2024-08-02 15:22:41.638+01
9	20240802082532_edit_users_status_table.ts	1	2024-08-02 15:22:41.664+01
10	20240808131835_users_phone_verification_added.ts	2	2024-08-08 14:25:58.446+01
11	20240916194605_image.ts	3	2024-09-16 20:57:53.447+01
12	20241001151915_transaction_update.ts	4	2024-10-01 16:23:45.411+01
13	20241001163714_account_number.ts	5	2024-10-01 17:45:31.324+01
14	20241004145818_modify_balance_colum.ts	6	2024-10-04 16:02:40.041+01
15	20241008044104_banks_table.ts	7	2024-10-08 06:02:45.499+01
16	20241018171125_add_column_to_transaction_table.ts	8	2024-10-18 18:16:19.792+01
17	20241018200021_add_column_to_transaction_table.ts	9	2024-10-18 21:02:27.982+01
18	20241018201508_add_column_to_transaction_table.ts	10	2024-10-18 21:18:07.537+01
19	20241020105210_sender_account_details.ts	11	2024-10-20 11:56:14.739+01
20	20241020105902_update_transactions_description_column.ts	12	2024-10-20 12:02:01.282+01
21	20241021170627_kycs.ts	13	2024-10-21 18:43:27.945+01
22	20241105191815_notification_table.ts	14	2024-11-05 20:31:31.363+01
23	20241105193809_update_notification.ts	15	2024-11-05 20:51:11.928+01
24	20241107093525_add_receiver_user_id_to_transactions_table.ts	16	2024-11-07 10:39:17.996+01
25	20241107100126_change_sender_to_owner_notifications_table.ts	17	2024-11-07 11:07:45.242+01
26	20241113153705_add_role_to_users_table.ts	18	2024-11-13 17:22:17.354+01
27	20241118144817_update_notification_table_to_include_is_viewed.ts	19	2024-11-18 16:00:55.386+01
28	20241119160452_add_super_admin_role_to_enum.ts	20	2024-11-19 17:39:57.846+01
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: kyc_verifications; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.kyc_verifications (id, user_id, id_card, utility_bill, face_verification, status, created_at, updated_at, rejected_reason) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.notifications (id, title, message, user_id, is_read, created_at, updated_at, receiver, is_viewed) FROM stdin;
54a6f427-8e75-421d-8a18-acfe8add6bbc	Transfer successful	You have successfully transferred 1000 to 4666869543 account	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-06 21:29:05.610307+01	2024-11-06 21:29:05.610307+01	\N	f
71f95cb9-4cb6-4283-a9d0-4d094b9802df	Transfer successful	You have successfully transferred 500 to 4666869543 account	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-06 21:49:33.317243+01	2024-11-06 21:49:33.317243+01	\N	f
b035ae2e-1fcc-4dff-8d14-12a54de44b18	Transfer successful	You have successfully transferred 500 to 4666869543 account	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-07 10:47:02.039824+01	2024-11-07 10:47:02.039824+01	\N	f
3777a17b-09c5-4649-be92-cea9a03a2431	Transfer successful	You have successfully transferred 500 to Ayodeji Adebolu.	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-07 11:23:09.50359+01	2024-11-07 11:23:09.50359+01	\N	f
2719f4d7-cc1b-4ec4-8c99-d34daebad1dc	Transfer successful	You have successfully transferred #500 from 6894944948 to AYODEJI OLUBUNMI ADEBOLU	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-07 12:32:12.33997+01	2024-11-07 12:32:12.33997+01	\N	f
d76fc17c-baf3-428e-b2f5-1e50036d02f6	Account credited successfully	Your account 6894944948 has been credited with the sum of 4000 by Ayodeji Adebolu.	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-07 13:02:23.149337+01	2024-11-07 13:02:23.149337+01	\N	f
3555457a-1075-4e54-a8b9-07a727a1ae2a	Transfer successful	You have successfully transferred #500 from 6894944948 account to AYODEJI OLUBUNMI ADEBOLU's Access Bank account 0728453360	64b0fb96-3b7b-41b0-b862-306c96a68e59	f	2024-11-07 13:10:41.52007+01	2024-11-07 13:10:41.52007+01	\N	f
3e6b3f52-ccb1-4577-9426-6615038c0a91	Role Change Notification	Your role has been changed to a customer.	138875b5-9a26-4402-9e3c-6ba7afe1e040	f	2024-11-23 14:54:31.246589+01	2024-11-23 14:54:31.246589+01	\N	f
9b7ad5ec-005f-4ae3-818b-096ebb5b428a	Account credited successfully	Your account 4666869543 has been credited with the sum of 500 by Fola Adebolu.	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-07 11:23:09.50987+01	2024-11-07 11:23:09.50987+01	\N	t
c92b8b9b-3c29-46e5-8e52-df4a45b49961	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 232000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:15:00.020387+01	2024-11-15 15:15:00.020387+01	\N	t
0d6a22d6-e74a-41f8-9fcf-dfcedc500bcd	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 228000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-15 14:45:25.433325+01	2024-11-15 14:45:25.433325+01	\N	t
5209286e-8468-4b55-81ab-5b4163bab624	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 230000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-15 15:06:53.870381+01	2024-11-15 15:06:53.870381+01	\N	t
37c478b4-f92c-4006-a2a1-903a249a0b0c	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 230000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:06:48.3609+01	2024-11-15 15:06:48.3609+01	\N	t
7e7714cb-0efd-45a1-b6eb-20a7d6c52820	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 230000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:06:53.958166+01	2024-11-15 15:06:53.958166+01	\N	t
fa79c0f7-3823-490a-8ef1-3d7405da3b34	Transfer successful	You have successfully transferred 4000 to undefined.	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-07 13:02:23.142001+01	2024-11-07 13:02:23.142001+01	\N	t
30629769-baac-4bb9-a367-4b337e18536a	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 228000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-15 14:42:45.408289+01	2024-11-15 14:42:45.408289+01	\N	t
61937b89-2d5a-41a3-80af-57b586e11540	Image upload successful	You have successfully uploaded an image to your profile.	138875b5-9a26-4402-9e3c-6ba7afe1e040	f	2024-11-22 22:53:53.059321+01	2024-11-22 22:53:53.059321+01	\N	t
01f6fe24-d462-4754-aa20-162cd7de7359	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 233000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:16:27.94551+01	2024-11-15 15:16:27.94551+01	\N	t
467cb09d-26a3-4860-9ebd-905929ba7fe0	Image upload successful	You have successfully uploaded an image to your profile.	138875b5-9a26-4402-9e3c-6ba7afe1e040	f	2024-11-22 22:57:09.313564+01	2024-11-22 22:57:09.313564+01	\N	t
a84e7a27-1a82-45f4-be97-cf4446c52fbd	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 230000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-15 15:06:53.880441+01	2024-11-15 15:06:53.880441+01	\N	t
97175670-dbb7-4878-8d1a-cd05e8393348	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 231000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:13:33.090538+01	2024-11-15 15:13:33.090538+01	\N	t
f79d105b-3c56-4a83-9fcb-425cd6bb4030	Transfer successful	You have successfully transferred #49000 from 8699751545 account to AYODEJI OLUBUNMI ADEBOLU's Access Bank account 0728453360	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-09 14:14:30.989584+01	2024-11-09 14:14:30.989584+01	\N	t
05fa6212-9580-4cda-8ddc-8b12208cc930	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 231000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:13:32.972798+01	2024-11-15 15:13:32.972798+01	\N	t
86495869-9f52-4723-a8a8-ec9ee69315d7	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 228000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-15 14:43:31.484108+01	2024-11-15 14:43:31.484108+01	\N	t
04773a8b-f743-418e-b73f-f943eaf7ce9c	Transfer successful	You have successfully transferred 5000 to 6894944948 account	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-06 17:06:33.361751+01	2024-11-06 17:06:33.361751+01	\N	t
b473fb1e-bdd3-46ed-847a-c82f68ad6261	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 227000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-15 14:37:06.778852+01	2024-11-15 14:37:06.778852+01	\N	t
bdc3193e-db5b-4584-bc02-3c2bddc5db26	Your account credited successfully	Your account number 4cd159b4-9454-4434-ad46-e93bf3dbeb37 has been credited successfully with 500.00 naira and this account has new balance of 190000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-07 17:16:05.411889+01	2024-11-07 17:16:05.411889+01	\N	t
2389b3ab-9a4c-463a-97f6-8081f6805b9d	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 231000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:13:26.778487+01	2024-11-15 15:13:26.778487+01	\N	t
e2cceb6a-e9c2-4536-83b3-2623cc476056	Transfer successful	You have successfully transferred #1000 from 8699751545 account to AYODEJI OLUBUNMI ADEBOLU's Access Bank account 0728453360	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	f	2024-11-09 13:38:25.073855+01	2024-11-09 13:38:25.073855+01	\N	t
aafd0eb7-d03f-407a-8c38-53a848a26cb9	Your account credited successfully	Your account number 18d966b1-4004-4d25-895e-874301363026 has been credited successfully with 1000.00 naira and this account has new balance of 231000.00	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	t	2024-11-15 15:13:32.905899+01	2024-11-15 15:13:32.905899+01	\N	t
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.otps (id, user_id, otp, phone_number, is_used, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.transactions (id, user_id, amount, transaction_type, transaction_date, transaction_status, description, account_id, reference_number, created_at, updated_at, transaction_source, receiving_account, account_number, receiving_account_number, receiving_bank_name, receiver_account_name, sender_account_number, sender_account_name, sender_bank_name, receiver_user_id) FROM stdin;
fe0000c2-6c2c-444a-b4b4-67063e298bc2	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-01	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	121wbuo9mp	2024-10-01 18:04:18.634186+01	2024-10-01 18:04:18.634186+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
7696fe3d-9760-450b-9228-22da3be7cb06	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-01	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	rt4dhc0c24	2024-10-01 18:09:43.572623+01	2024-10-01 18:09:43.572623+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
b8f76d42-2753-45fd-9174-530e0760a340	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-01	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	dxnvp4kzfp	2024-10-01 18:13:52.195408+01	2024-10-01 18:13:52.195408+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
3d082a99-8ab4-40b2-9712-ecd21f8a95d8	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-01	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	pwau2ird34	2024-10-01 18:17:49.477818+01	2024-10-01 18:17:49.477818+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
0382c190-ecd8-458a-887b-882e01545f1c	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	44000.00	credit	2024-10-03	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	1vxsjh5pq1	2024-10-03 15:00:00.029621+01	2024-10-03 15:00:00.029621+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
7da9d630-6c7c-4e5b-98c9-581c0aa58903	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	26000.00	credit	2024-10-03	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	4u3na97f9x	2024-10-03 17:09:12.08476+01	2024-10-03 17:09:12.08476+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
ec813ce2-9e44-4448-af75-ab44708bd19e	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	50000.00	credit	2024-10-03	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ai6yagxfi7	2024-10-03 17:10:33.990038+01	2024-10-03 17:10:33.990038+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
7b1bb9b6-68b9-499b-b66a-bcfaa8882e2c	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	100000.00	credit	2024-10-03	completed	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	z6oghu2ukr	2024-10-03 17:41:54.057822+01	2024-10-03 17:41:54.057822+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
c0cf1386-3418-40ee-b01b-81ca1fd7e201	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	75000.00	credit	2024-10-03	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	m0kxv34nyw	2024-10-03 17:55:41.063569+01	2024-10-03 17:55:41.063569+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
f2eeef37-ac08-4be2-8398-8ee43e5b2358	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	llzqf0wtpm	2024-10-04 17:03:48.065432+01	2024-10-04 17:03:48.065432+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
6e1d70f3-a5f5-4751-b8a0-bd679960da4b	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	faq963bq2x	2024-10-04 17:04:57.404281+01	2024-10-04 17:04:57.404281+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
d0b47ea9-afff-403b-937b-fbe47cab69d5	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	oy7l3dm3vt	2024-10-04 17:17:10.09206+01	2024-10-04 17:17:10.09206+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
bf406049-6fee-43f6-9d2b-e8b6d40f6393	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	wtnu1w9f1n	2024-10-04 17:20:52.137038+01	2024-10-04 17:20:52.137038+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
c04e68fe-92a5-4724-add2-2a7d27a9264d	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	hl5balu2om	2024-10-04 17:26:39.034788+01	2024-10-04 17:26:39.034788+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
aa601d51-3956-4379-983a-59a6ebb8cb95	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	d2hne02d6h	2024-10-04 17:53:55.89753+01	2024-10-04 17:53:55.89753+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
bec86009-7829-49e9-ba3e-1f20a47a77c8	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	8blqciodn9	2024-10-04 19:49:00.202442+01	2024-10-04 19:49:00.202442+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
000c7fe5-2d80-4e1b-a5f5-83ce5c83ebc7	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ix9qm2m7mx	2024-10-04 20:30:10.795667+01	2024-10-04 20:30:10.795667+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
4de86266-780f-4549-961a-e39a9440a1d6	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	epkit1ru9y	2024-10-04 20:52:39.357836+01	2024-10-04 20:52:39.357836+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
51954966-8653-473a-a9f3-373304a4842a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	skd4as8a5a	2024-10-04 21:19:58.489474+01	2024-10-04 21:19:58.489474+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
a1a6f590-20e3-4632-b62a-b5a38ac5a8c7	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	fxt7zfavy4	2024-10-04 21:36:40.689914+01	2024-10-04 21:36:40.689914+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
b93950ae-026c-4c26-8fa3-7b88888129a9	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	80000.00	credit	2024-10-04	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	5wdq31abg7	2024-10-04 21:40:27.180939+01	2024-10-04 21:40:27.180939+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
2b73d81c-574e-4534-b2cc-a2d754be89e8	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-05	pending	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	o9jxaqpn91	2024-10-05 05:37:00.368493+01	2024-10-05 05:37:00.368493+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
5a5bc0a6-2208-4cc5-a65d-9e905aa40734	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-05	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	sruhzvsg2n	2024-10-05 05:57:08.57668+01	2024-10-05 05:57:08.57668+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
be6f0672-23ee-408f-84f6-5ab51a0d0d3f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-05	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	qrf0zums4c	2024-10-05 06:24:51.88492+01	2024-10-05 06:24:51.88492+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
21bff94f-5d37-45f3-9e02-31c130e7a263	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-05	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	o77nz97fuk	2024-10-05 06:27:33.097225+01	2024-10-05 06:27:33.097225+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
a51711bc-e94c-45f2-a035-37e9193c040f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-05	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	cuikwcyw9e	2024-10-05 06:43:11.230361+01	2024-10-05 06:43:11.230361+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
384933fd-d0a8-4d19-b5d3-4dc364379dfd	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	25000.00	credit	2024-10-05	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	rlb4u935kk	2024-10-05 17:10:41.53927+01	2024-10-05 17:10:41.53927+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
0eaf0938-2ebf-431b-adac-300f37698fc7	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	15000.00	credit	2024-10-05	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	xy84x607r0	2024-10-05 17:14:03.32559+01	2024-10-05 17:14:03.32559+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
c20e52c5-c55e-441c-b6e8-2e60b7c04b1b	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	150000.00	credit	2024-10-05	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	494zixxhok	2024-10-05 17:34:20.140085+01	2024-10-05 17:34:20.140085+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
ea8cc3b3-2795-4d47-b4c8-53ce2857fb77	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5555555.00	credit	2024-10-05	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	kjrgxcq2hs	2024-10-05 17:42:27.601711+01	2024-10-05 17:42:27.601711+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
62be5b76-9668-46c5-8a55-f88bcda14c66	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	100000.00	credit	2024-10-05	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	353hoavjiy	2024-10-05 17:42:57.148453+01	2024-10-05 17:42:57.148453+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
7f38d30e-ef08-4a98-a8b2-b71100b4b623	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	120000.00	credit	2024-10-05	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	31zepfgcld	2024-10-05 17:48:36.033504+01	2024-10-05 17:48:36.033504+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
71c70210-dd05-45bc-9e38-47d3bad01534	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	25000.00	debit	2024-10-18	completed	I am using the testing mode of monnify	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-03029656062d7edfe132e140541c69-1729289592864	2024-10-18 23:13:12.871043+01	2024-10-18 23:13:12.871043+01	\N	\N	4666869543	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
611dd672-a74e-4be3-bee4-d870e5e98a49	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	19000.00	debit	2024-10-18	completed	Final payment made	4cd159b4-9454-4434-ad46-e93bf3dbeb37	ffw-33b35a65aa124b307daf3b1f2288b3-1729289798844	2024-10-18 23:16:38.845643+01	2024-10-18 23:16:38.845643+01	\N	\N	8060150433	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
092aedba-74c3-4a41-8892-ac0ce8552f79	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	32000.00	debit	2024-10-18	completed	crediting new payment	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-240a00e358c50c9139f518ba056557-1729290198965	2024-10-18 23:23:18.967208+01	2024-10-18 23:23:18.967208+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
f444f841-51e1-4223-86a7-b78ebf19c530	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	129000.00	credit	2024-10-20	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	000c26dm24	2024-10-20 12:20:16.68377+01	2024-10-20 12:20:16.68377+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
92f933b5-5f33-4333-b7d5-6e3a42bb5f92	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	139000.00	credit	2024-10-20	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	b592wcpntl	2024-10-20 11:18:20.554284+01	2024-10-20 11:18:20.554284+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
82695914-4c41-4e09-b1aa-06aeddc841c9	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	119000.00	credit	2024-10-20	completed	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	z9ztwzobgv	2024-10-20 11:29:08.490396+01	2024-10-20 11:29:08.490396+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
c5ee04bc-4d9c-423a-b906-6bba7a2a9ac0	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	4000.00	credit	2024-10-20	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	kr2nd3bc5y	2024-10-20 12:58:53.674835+01	2024-10-20 12:58:53.674835+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
6418cc07-6a98-4fa8-a417-512b8f37197e	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	4000.00	credit	2024-10-20	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	bswm7ffted	2024-10-20 13:03:59.003309+01	2024-10-20 13:03:59.003309+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
ff637c3a-25ad-4bb6-8c46-b8d2f578d49d	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	4000.00	credit	2024-10-20	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	h39ora6wgg	2024-10-20 13:04:43.214979+01	2024-10-20 13:04:43.214979+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
e3ce6fca-e813-4eac-b2fc-2d8541d37c90	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-20	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	f6s3fo16fe	2024-10-20 14:06:43.555827+01	2024-10-20 14:06:43.555827+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
35b211fd-1aa9-42d5-a8bb-a2d58d709b33	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-20	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	omt59474ha	2024-10-20 14:07:55.343698+01	2024-10-20 14:07:55.343698+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
71a80836-fd2a-44bf-afa6-fc5d3e4872a1	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-20	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	i6cdkva98y	2024-10-20 14:10:10.890241+01	2024-10-20 14:10:10.890241+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
62422b3a-1170-4d64-860d-78eda871295e	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	credit	2024-10-05	completed	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	r8rljkq18d	2024-10-05 17:52:00.242073+01	2024-10-05 17:52:00.242073+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
2815a3f3-a8d9-4386-82ed-c5e402a6cd2e	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-05	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	kwgjaj3226	2024-10-05 18:05:15.971573+01	2024-10-05 18:05:15.971573+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
d4395fdd-6ab0-46e0-bfde-4e649a34eda5	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	credit	2024-10-05	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	3qq9qwe4kc	2024-10-05 18:07:37.484696+01	2024-10-05 18:07:37.484696+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
bf1313e8-8f18-458b-b79d-1c3797ba649a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	credit	2024-10-05	completed	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	ff174sgmue	2024-10-05 18:10:42.346934+01	2024-10-05 18:10:42.346934+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
9efcc729-6693-4971-808a-37f04153b2fe	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-07	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	bcksvumcfn	2024-10-07 17:04:11.055422+01	2024-10-07 17:04:11.055422+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
e387d0fe-3d36-4f19-84e3-9d4a1e1e4637	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-10-07	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	vto6vnfh5p	2024-10-07 17:16:11.965399+01	2024-10-07 17:16:11.965399+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
c4cd2885-df2b-4e82-afbc-10e5d0d07361	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-17	completed	payment for service	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-0ac5dba983	2024-10-17 14:55:43.510857+01	2024-10-17 14:55:43.510857+01	\N	163f8aa9-f0f0-4391-a42d-fb6ef88bc9af	8699751545	\N	\N	\N	\N	\N	\N	\N
f68961a4-eab9-4e9c-9fef-9d8c02970a77	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	I want to pay for the goods that i purchased	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-1f0b3c4b05	2024-10-18 18:21:00.110879+01	2024-10-18 18:21:00.110879+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
381aa535-fee5-4ac1-b8d5-3faa9d661def	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	I want to pay for the goods that i purchased	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-d444d29da0	2024-10-18 18:24:17.965059+01	2024-10-18 18:24:17.965059+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
fea9608f-77ba-4c1f-8cde-6b6282b42698	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	I want to pay for the goods that i purchased	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-af1dfca87c	2024-10-18 18:29:50.07734+01	2024-10-18 18:29:50.07734+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
cd987fef-97c9-49e2-887f-a059602947a4	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	I want to pay for the goods that i purchased	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-d4c7cec72c	2024-10-18 18:30:49.38718+01	2024-10-18 18:30:49.38718+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
a02522f4-2c3a-4a35-ae53-f45a69d09d26	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	I want to pay for the goods that i purchased	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-4ad26b8ba9	2024-10-18 21:18:59.116975+01	2024-10-18 21:18:59.116975+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
f82c6fab-0deb-479b-b1f9-872c86323c70	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	I want to pay for the goods that i purchased	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-6e5a69c9d4	2024-10-18 21:19:04.560608+01	2024-10-18 21:19:04.560608+01	\N	\N	4666869543	0728453360	Access bank	\N	\N	\N	\N	\N
8263a206-66e2-4bbf-8bad-a3f3b81676f0	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-edc39c96bc	2024-10-18 21:20:33.754236+01	2024-10-18 21:20:33.754236+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
977c7d5e-ded2-4c4c-9833-b693400afc9c	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-214d58d210	2024-10-18 21:20:43.064569+01	2024-10-18 21:20:43.064569+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
89cbacd3-07af-4a82-bebd-cf637bba295b	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-bd175c79c8	2024-10-18 21:21:58.115263+01	2024-10-18 21:21:58.115263+01	\N	\N	4666869543	0728453360	Access bank	\N	\N	\N	\N	\N
982c3b43-2373-4e1e-a160-3ed104d65fac	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-f9420d16b4	2024-10-18 21:30:57.961509+01	2024-10-18 21:30:57.961509+01	\N	\N	4666869543	0728453360	Access bank	\N	\N	\N	\N	\N
ca87a108-0e5e-4975-9503-dfb9a58e6b37	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-8db1e9be99	2024-10-18 21:39:34.291237+01	2024-10-18 21:39:34.291237+01	\N	\N	4666869543	0728453360	Access bank	\N	\N	\N	\N	\N
146d03ba-4f14-429e-9d42-0f4864555713	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-6e375410dd	2024-10-18 21:41:37.772525+01	2024-10-18 21:41:37.772525+01	\N	\N	4666869543	0728453360	Access bank	\N	\N	\N	\N	\N
bb8cdeec-9b45-4911-9227-60074dbf6486	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-0b9565cdf5	2024-10-18 21:43:27.877767+01	2024-10-18 21:43:27.877767+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
a2f00919-e461-4b1d-aed8-30f19ac80dfe	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-ab636b6836	2024-10-18 21:43:36.318189+01	2024-10-18 21:43:36.318189+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
f0ecd2b5-c9da-48ff-8f1e-94ef316e07c8	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-c6233f2b6d	2024-10-18 21:45:12.38686+01	2024-10-18 21:45:12.38686+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
7d7c01bf-7a88-4f09-9182-f3f5ad6cfb70	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-ea566040ba-1729284844884	2024-10-18 21:54:04.887833+01	2024-10-18 21:54:04.887833+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
d318cdf3-b988-4dde-929b-0d03f5db777f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-a531f58c99-1729284851231	2024-10-18 21:54:11.23231+01	2024-10-18 21:54:11.23231+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
479ce7c9-48c4-4268-9655-23e4248cee60	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-2afdf6a67073aa352c0690a57b6720-1729285113319	2024-10-18 21:58:33.323456+01	2024-10-18 21:58:33.323456+01	\N	\N	4666869543	0728453360	\N	\N	\N	\N	\N	\N
6a629892-bed4-407b-832e-e352b9be35a9	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-8f64e7016fff562df72ca12b2ffeab-1729285281222	2024-10-18 22:01:21.225067+01	2024-10-18 22:01:21.225067+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
b5dee765-3208-48c0-9215-c6e5abbddfd9	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-637cb5609b65d11363c0541a6a44b7-1729285387956	2024-10-18 22:03:07.9598+01	2024-10-18 22:03:07.9598+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
4546d82a-7038-4764-bee1-f47031489ad8	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-ea0f4a162e482de1c0898734c47b21-1729285493338	2024-10-18 22:04:53.340203+01	2024-10-18 22:04:53.340203+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
2dd5bb84-2e0b-4123-b41f-6bd330b43957	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-5ffcf026a2b9289b7c94164ed4fc27-1729285564712	2024-10-18 22:06:04.714866+01	2024-10-18 22:06:04.714866+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
814bf884-ef27-4fba-9ae1-552ae3720804	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	This is the second payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-ef87b0172e4334f38e34ed8ce57771-1729285569263	2024-10-18 22:06:09.266093+01	2024-10-18 22:06:09.266093+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
b09cb476-ebd3-49e2-969c-aebc471d4a72	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	pending	crypto payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-b6e4dc6a6f1d3a0ca16065382a3771-1729285592696	2024-10-18 22:06:32.698669+01	2024-10-18 22:06:32.698669+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
1c11cee8-5b29-46c5-96fe-416aac730bfd	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-10-18	completed	i bought suya	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-7a0740559f035585230da2772213c3-1729285618036	2024-10-18 22:06:58.037635+01	2024-10-18 22:06:58.037635+01	\N	\N	4666869543	0728453360	Access bank	Ayodeji Adebolu	\N	\N	\N	\N
db1087bb-329c-4e98-b367-7275da25d563	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-10-18	pending	i bought suya	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-5874580dd5e42044d5d9174eb9c590-1729285855999	2024-10-18 22:10:56.004164+01	2024-10-18 22:10:56.004164+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
f5c7d7fc-3037-4116-a124-44f8c165a881	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-10-18	pending	i bought suya	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-40754eb8c75e72febc188d132286b9-1729285887201	2024-10-18 22:11:27.203434+01	2024-10-18 22:11:27.203434+01	\N	\N	4666869543	0728453360	\N	Ayodeji Adebolu	\N	\N	\N	\N
7b091fcc-9039-4aad-af57-d7db1a91f0bd	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-10-18	completed	i bought suya	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-1d12e2e4b4d56e386888c5f40fd611-1729285891014	2024-10-18 22:11:31.016237+01	2024-10-18 22:11:31.016237+01	\N	\N	4666869543	0728453360	Access bank	Ayodeji Adebolu	\N	\N	\N	\N
d96eb18f-afe8-446e-aee2-9d5ee23e3769	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-10-18	completed	crediting users	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-aef8fd6ae96b0f96ac926efd0efe2d-1729289130510	2024-10-18 23:05:30.513286+01	2024-10-18 23:05:30.513286+01	\N	\N	4666869543	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
c0520db6-3d3d-48f4-9536-4e270f7f372c	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	19000.00	credit	2024-10-20	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	lcoguj36x9	2024-10-20 11:54:58.336652+01	2024-10-20 11:54:58.336652+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
7b2abf60-3fb2-4144-96e1-800e66e5e478	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	119000.00	credit	2024-10-20	pending	user credit account	4cd159b4-9454-4434-ad46-e93bf3dbeb37	62m8u5ra9d	2024-10-20 12:12:16.479526+01	2024-10-20 12:12:16.479526+01	\N	\N	8060150433	\N	\N	\N	\N	\N	\N	\N
b686f5f2-ecec-4b25-b102-952d9bc68d7c	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	2000.00	credit	2024-10-21	completed	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	caurtp7sw5	2024-10-21 09:49:00.623974+01	2024-10-21 09:49:00.623974+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
16b977f8-8b67-4143-b5ef-ca6f23e484cf	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-21	completed	transportation	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-223ce1605d160d3d1c3b39c0fdb482-1729500701663	2024-10-21 09:51:41.666886+01	2024-10-21 09:51:41.666886+01	\N	\N	4666869543	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
d326aa28-b7d6-4e51-856b-ffe0c2bbb5cf	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-21	completed	Payment for pizza	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-dfc521-1729501354140	2024-10-21 10:02:34.142775+01	2024-10-21 10:02:34.142775+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
55b57ce1-347c-4ea3-a743-9d65b701eb52	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-21	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	3sjm9z9dua	2024-10-21 10:21:04.573086+01	2024-10-21 10:21:04.573086+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
1d2533b7-557e-41f7-bb98-85a0c13ba829	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-21	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	x1qrmrhy2q	2024-10-21 10:21:44.276409+01	2024-10-21 10:21:44.276409+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
5f014ec7-fed2-4a48-9912-015999d15e69	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	50000.00	credit	2024-10-21	pending	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	u67humkgwg	2024-10-21 11:23:02.106947+01	2024-10-21 11:23:02.106947+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
b52bfee0-bd70-416f-8f64-29a643ef87f2	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	55000.00	credit	2024-10-21	pending	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	350i8w48x1	2024-10-21 11:24:11.568845+01	2024-10-21 11:24:11.568845+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
a513dbe8-c932-4c8b-90b6-92dae6aa3bf0	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-10-21	pending	user credit account	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	shj2j13rur	2024-10-21 11:28:12.429403+01	2024-10-21 11:28:12.429403+01	\N	\N	8699751545	\N	\N	\N	\N	\N	\N	\N
59fa5245-5d2c-4458-85bc-53c221ed294a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-21	completed	crediting user	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	{}	2024-10-21 19:25:23.949481+01	2024-10-21 19:25:23.949481+01	\N	163f8aa9-f0f0-4391-a42d-fb6ef88bc9af	8699751545	\N	\N	\N	\N	\N	\N	\N
3bb57c6d-d44c-4bdb-aa2c-4466c8792cdb	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-21	completed	payment	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-9fb59e2aa2-1729535846354	2024-10-21 19:37:26.357309+01	2024-10-21 19:37:26.357309+01	\N	163f8aa9-f0f0-4391-a42d-fb6ef88bc9af	8699751545	\N	\N	\N	\N	\N	\N	\N
b42a7866-991a-4457-854c-a09c74ee2067	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-21	completed	payment	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-9375816280-1729539379665	2024-10-21 20:36:19.668526+01	2024-10-21 20:36:19.668526+01	\N	2906d83c-74b0-4fad-9249-32af63b2359d	8699751545	\N	\N	\N	\N	\N	\N	\N
f426cb56-1cb1-4896-84d9-0cd5d5de0e82	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	15000.00	debit	2024-10-21	completed	payment 2	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-7cdfc521a3-1729539648418	2024-10-21 20:40:48.421798+01	2024-10-21 20:40:48.421798+01	\N	2906d83c-74b0-4fad-9249-32af63b2359d	8699751545	\N	\N	\N	\N	\N	\N	\N
5c6dccf1-5c6b-446e-b236-4e5910cd51ea	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-10-22	completed	daily payment	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-7cf6d8e2f8-1729615614329	2024-10-22 17:46:54.334201+01	2024-10-22 17:46:54.334201+01	\N	2906d83c-74b0-4fad-9249-32af63b2359d	8699751545	\N	\N	\N	\N	\N	\N	\N
d53768db-393f-40c7-b21c-da634cea68b5	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	40000.00	debit	2024-10-22	completed	daily payment	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-c072fabb85-1729615681023	2024-10-22 17:48:01.024722+01	2024-10-22 17:48:01.024722+01	\N	2906d83c-74b0-4fad-9249-32af63b2359d	8699751545	\N	\N	\N	\N	\N	\N	\N
09c54f5f-6df5-41d2-b1a9-60a3c6ce314f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-11-03	completed	Sunday enjoyment 	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-31fe27-1730632405056	2024-11-03 12:13:25.067484+01	2024-11-03 12:13:25.067484+01	\N	\N	4666869543	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
844341bb-6987-4c3f-b791-5e29d64ff5b3	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-11-03	pending	Testing transfer on mobile 	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-0cbebe-1730632498028	2024-11-03 12:14:58.029644+01	2024-11-03 12:14:58.029644+01	\N	\N	8699751545	0728453360	\N	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
7b15ed78-b29c-490e-8531-f9db28d99af6	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-11-03	pending	Testing transfer on mobile 	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-d1fd6a-1730632521738	2024-11-03 12:15:21.739431+01	2024-11-03 12:15:21.739431+01	\N	\N	8699751545	0728453360	\N	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
e88cbea9-6a3b-43a9-93e9-4a26043281dd	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-11-03	completed	Testing 	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-4dc38e-1730632678242	2024-11-03 12:17:58.243585+01	2024-11-03 12:17:58.243585+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
41c7290d-d072-4a69-9b4e-0e923642ca71	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-11-03	completed	Still	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-cbe630-1730633285111	2024-11-03 12:28:05.112634+01	2024-11-03 12:28:05.112634+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
02f59cb5-a6d8-4fdd-b78e-6ea902fd23c2	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-11-03	completed	Testing 	4cd159b4-9454-4434-ad46-e93bf3dbeb37	ffw-73b588-1730635350358	2024-11-03 13:02:30.361499+01	2024-11-03 13:02:30.361499+01	\N	\N	8060150433	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
f95ac410-6ce2-4b30-870c-ea0722b5ecfa	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	debit	2024-11-03	pending	Sunday	4cd159b4-9454-4434-ad46-e93bf3dbeb37	ffw-9ae1b5-1730635409897	2024-11-03 13:03:29.898505+01	2024-11-03 13:03:29.898505+01	\N	\N	8060150433	0728453360	\N	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
33f6cc2c-a19c-4f3d-a339-27354dd5f71c	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	debit	2024-11-06	completed	payment	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-48ee358047-1730909193261	2024-11-06 17:06:33.275815+01	2024-11-06 17:06:33.275815+01	\N	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	4666869543	\N	\N	\N	\N	\N	\N	\N
e9011f98-8e57-4ac9-b639-d280a9bad96e	64b0fb96-3b7b-41b0-b862-306c96a68e59	1000.00	debit	2024-11-06	completed	Testing	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-9bd1da8879-1730924945462	2024-11-06 21:29:05.471611+01	2024-11-06 21:29:05.471611+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	\N	\N	\N	\N	\N	\N	\N
dc2134e6-edf3-4619-9f8f-76c334c9fda6	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-06	completed	Re test	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-cb097c6a12-1730926173243	2024-11-06 21:49:33.246496+01	2024-11-06 21:49:33.246496+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	4666869543	\N	\N	\N	\N	\N	\N
3e4430c2-8d52-486c-a696-51d1b38d91b8	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Thursday testing	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-680a70f544-1730972821877	2024-11-07 10:47:01.882039+01	2024-11-07 10:47:01.882039+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	4666869543	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
4b41f4c3-da9c-4d6d-bdb0-346ffe801c77	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Pay	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-efb809ccc5-1730973591261	2024-11-07 10:59:51.26407+01	2024-11-07 10:59:51.26407+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	4666869543	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
f5995c59-c75a-46cd-9075-1f2ad0054c31	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Pay	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-c5a240f650-1730974364897	2024-11-07 11:12:44.908868+01	2024-11-07 11:12:44.908868+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	4666869543	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
984c005e-9153-424d-b9af-ec52dc30d1da	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Pay	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-8a22cadb1b-1730974644136	2024-11-07 11:17:24.139758+01	2024-11-07 11:17:24.139758+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	4666869543	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
252e3688-e790-4fbb-95d5-e5ed03ea49d4	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed		9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-c7ee044193-1730974989414	2024-11-07 11:23:09.41924+01	2024-11-07 11:23:09.41924+01	\N	513cf541-2d94-4f6f-be2c-e01b87a8d77f	6894944948	4666869543	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
47cb3f7e-f61b-42d2-8b5a-7db7aec5aefd	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Testing	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-f74fbd-1730975061790	2024-11-07 11:24:21.79243+01	2024-11-07 11:24:21.79243+01	\N	\N	6894944948	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
a35a4d60-1090-4133-9f67-c053ec55e0d2	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Try	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-00667c-1730979129758	2024-11-07 12:32:09.760189+01	2024-11-07 12:32:09.760189+01	\N	\N	6894944948	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
5e128d77-5d32-4d81-b216-df471c241db3	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	4000.00	debit	2024-11-07	completed	testing today	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ffw-681b95dbc1-1730980943085	2024-11-07 13:02:23.088554+01	2024-11-07 13:02:23.088554+01	\N	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	4666869543	6894944948	Fund Flow	\N	\N	\N	\N	64b0fb96-3b7b-41b0-b862-306c96a68e59
e4398ac8-b5c5-4996-9cc2-bbe40b47d839	64b0fb96-3b7b-41b0-b862-306c96a68e59	500.00	debit	2024-11-07	completed	Thank you money 	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ffw-5b8a6b-1730981438625	2024-11-07 13:10:38.626573+01	2024-11-07 13:10:38.626573+01	\N	\N	6894944948	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
c8c3dda5-060f-448b-966b-0fa92b4d7268	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	10000.00	credit	2024-11-07	pending	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	ul925qn53z	2024-11-07 14:44:19.862951+01	2024-11-07 14:44:19.862951+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
881f0230-8411-49d8-91a9-2c7f410f0c8d	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	60000.00	credit	2024-11-07	completed	user credit account	513cf541-2d94-4f6f-be2c-e01b87a8d77f	jrjyq0qbp1	2024-11-07 14:49:10.548163+01	2024-11-07 14:49:10.548163+01	\N	\N	4666869543	\N	\N	\N	\N	\N	\N	\N
e18b87da-d11e-4c0f-a27d-7f1eeb3544bf	64b0fb96-3b7b-41b0-b862-306c96a68e59	5000.00	credit	2024-11-07	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	ox3n62n6lk	2024-11-07 16:52:30.810307+01	2024-11-07 16:52:30.810307+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
9f3891ce-493d-42ed-b4c6-61fcaeba193b	64b0fb96-3b7b-41b0-b862-306c96a68e59	5000.00	credit	2024-11-07	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	jyxm5hyr8y	2024-11-07 16:53:55.989626+01	2024-11-07 16:53:55.989626+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
286dcc5d-f0f3-48d4-ba51-79c2f38222f8	64b0fb96-3b7b-41b0-b862-306c96a68e59	5000.00	credit	2024-11-07	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	7kgu09lfbf	2024-11-07 16:56:38.645013+01	2024-11-07 16:56:38.645013+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
554a6f3e-80d9-4e41-b8c9-9c3ffaacf06f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	600000.00	credit	2024-11-07	pending	user credit account	18d966b1-4004-4d25-895e-874301363026	mifp99qor4	2024-11-07 17:09:27.832847+01	2024-11-07 17:09:27.832847+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
d528cb4c-13d9-4009-bfc5-b2006fd6859a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	100000.00	credit	2024-11-07	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	0phqyfs5p1	2024-11-07 17:11:42.873112+01	2024-11-07 17:11:42.873112+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
28ae8a1f-615b-48d5-831b-b8fb63f2c2c9	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	100000.00	credit	2024-11-07	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	3t2gk33ld0	2024-11-07 17:15:52.623018+01	2024-11-07 17:15:52.623018+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
ba37d570-7b73-44ff-8f39-4b4fc674e9bb	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-09	completed	testing	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-7553d1-1731155898563	2024-11-09 13:38:18.573612+01	2024-11-09 13:38:18.573612+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
19c6b723-1e3b-4261-8f4c-834df806cd7a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	49000.00	debit	2024-11-09	completed	payment	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-3f19d2-1731158066539	2024-11-09 14:14:26.545016+01	2024-11-09 14:14:26.545016+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
f8482bb9-7708-49a1-ad97-9b44bdf8e45c	64b0fb96-3b7b-41b0-b862-306c96a68e59	1000.00	credit	2024-11-13	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	bshowfvzlk	2024-11-13 18:13:07.382684+01	2024-11-13 18:13:07.382684+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
d929a35f-f5b4-4c79-ade8-3ce6a3bd3fec	64b0fb96-3b7b-41b0-b862-306c96a68e59	1000.00	credit	2024-11-13	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	0lpn0kckzc	2024-11-13 18:13:52.58646+01	2024-11-13 18:13:52.58646+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
36537992-db56-4e64-905a-6747576b9f35	64b0fb96-3b7b-41b0-b862-306c96a68e59	2000.00	credit	2024-11-13	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	5j6lgf6ct0	2024-11-13 18:15:04.454082+01	2024-11-13 18:15:04.454082+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
c09cf71b-65a6-4315-b153-08afbf8d61ee	64b0fb96-3b7b-41b0-b862-306c96a68e59	1000.00	credit	2024-11-13	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	a2dx8ujwjw	2024-11-13 18:19:00.243144+01	2024-11-13 18:19:00.243144+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
7e055e02-67ee-40ea-b9a0-a971e98bae07	64b0fb96-3b7b-41b0-b862-306c96a68e59	100.00	credit	2024-11-13	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	avogwxu6ie	2024-11-13 18:26:00.403057+01	2024-11-13 18:26:00.403057+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
82292efc-8915-476d-a60a-ab3855b9b043	64b0fb96-3b7b-41b0-b862-306c96a68e59	1000.00	credit	2024-11-14	pending	user credit account	9b7452b0-d98a-4c5d-8acc-83cd38da5f0d	255klvhtma	2024-11-14 19:01:51.8002+01	2024-11-14 19:01:51.8002+01	\N	\N	6894944948	\N	\N	\N	\N	\N	\N	\N
f6574beb-c0fa-46ab-9f54-410fadcd278a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	15000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	n4scoemndx	2024-11-15 12:29:13.310218+01	2024-11-15 12:29:13.310218+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
d174b961-a04b-4278-88dd-6c9362c2fa74	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	5000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	bkafy99n6g	2024-11-15 12:37:01.198741+01	2024-11-15 12:37:01.198741+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
08004460-a3f1-4bf1-af5a-c91ab6b4b24f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	sc58o2ekjh	2024-11-15 12:52:44.230147+01	2024-11-15 12:52:44.230147+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
0e25d6b4-975a-43e2-bcfc-fba38fbf35eb	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	afhommvuk6	2024-11-15 13:34:41.143318+01	2024-11-15 13:34:41.143318+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
b18c94c4-0cbe-42ab-a6f4-568b0e9e368d	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	kjom7fhf3e	2024-11-15 13:39:18.146593+01	2024-11-15 13:39:18.146593+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
21e4885c-28ce-4d2c-a749-35ef23666613	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	pending	user credit account	18d966b1-4004-4d25-895e-874301363026	9z7m7x5qf4	2024-11-15 13:51:11.483333+01	2024-11-15 13:51:11.483333+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
58f7e4eb-db27-4739-982b-de6c10602c7e	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	rtq1bjb2vc	2024-11-15 13:52:50.351035+01	2024-11-15 13:52:50.351035+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
6d9e7491-f57d-4fb7-8586-063deddec90a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	tvyqgktyfq	2024-11-15 13:53:58.135174+01	2024-11-15 13:53:58.135174+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
0d8c235a-040e-49ba-949b-68627c6c0a59	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	giac3igpdz	2024-11-15 14:06:58.66105+01	2024-11-15 14:06:58.66105+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
152b40d0-cb39-4930-a144-4f3fb9eefd03	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	emib1up5z4	2024-11-15 14:36:43.902882+01	2024-11-15 14:36:43.902882+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
fae5c66c-c77c-45a6-9efa-d2556d9a021a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	bj46v40700	2024-11-15 14:42:31.328515+01	2024-11-15 14:42:31.328515+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
c52471f5-73aa-47c2-ac36-645720c81253	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	1zfn5kf6w1	2024-11-15 15:04:39.823737+01	2024-11-15 15:04:39.823737+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
e9b6607c-af2e-44f9-ae61-165b2940c735	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	3359qj1y0r	2024-11-15 15:06:32.834018+01	2024-11-15 15:06:32.834018+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
ab8c3fb3-7fd1-4928-b19b-74934a37a47a	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	e4jkksm81d	2024-11-15 15:13:10.157792+01	2024-11-15 15:13:10.157792+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
edfeb598-274e-4d1d-86ce-4395e382b574	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	7oi3owkcj5	2024-11-15 15:14:42.917381+01	2024-11-15 15:14:42.917381+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
4ec36e7a-123d-4ab4-9767-2b61ced607a3	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	credit	2024-11-15	completed	user credit account	18d966b1-4004-4d25-895e-874301363026	buuoewxbw4	2024-11-15 15:16:11.21074+01	2024-11-15 15:16:11.21074+01	\N	\N	8160577675	\N	\N	\N	\N	\N	\N	\N
e1ec8ac7-d727-4519-a2fc-c32f6845dea3	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	TESTING	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-83426957d4-1732277361664	2024-11-22 13:09:21.66704+01	2024-11-22 13:09:21.66704+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	\N	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
679d9583-70e2-4de9-be55-67c6cb0d5d63	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	another one	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-1bb7ff81d3-1732278511222	2024-11-22 13:28:31.225822+01	2024-11-22 13:28:31.225822+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	\N	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
82a618cd-58eb-44bd-a918-6632fb450bea	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	one of the testing	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-e3d03f65a9-1732278701048	2024-11-22 13:31:41.051565+01	2024-11-22 13:31:41.051565+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	\N	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
72a713dc-6820-4320-8a14-be4d1371fe3f	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	one more time	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-37114f60d9-1732279153703	2024-11-22 13:39:13.706275+01	2024-11-22 13:39:13.706275+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	\N	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
f5d38c10-572e-4b17-bc01-06097f899997	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	one	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-f6dbb5efbc-1732279321339	2024-11-22 13:42:01.340828+01	2024-11-22 13:42:01.340828+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
facea96e-299f-4ff3-86df-a87fb16bb65d	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	testing notification	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-8f180c-1732279854645	2024-11-22 13:50:54.647914+01	2024-11-22 13:50:54.647914+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
ac50b1c0-dc9f-4e8f-8134-aaa2ab5460ac	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	debit	2024-11-22	completed	testing	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-fec657-1732280026940	2024-11-22 13:53:46.941063+01	2024-11-22 13:53:46.941063+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
132202eb-10e0-4763-bd96-14ee3455f2ad	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	debit	2024-11-22	completed	testing	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-ea1017-1732280222019	2024-11-22 13:57:02.021115+01	2024-11-22 13:57:02.021115+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
969c6107-d7c3-4aff-9c26-98d47cf8e0f6	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	debit	2024-11-22	pending	testing	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-352965-1732280278329	2024-11-22 13:57:58.331051+01	2024-11-22 13:57:58.331051+01	\N	\N	8699751545	0728453360	\N	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
f91da3dc-8ab5-42f8-8186-6d29f4418fc4	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	1000	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-e3048f0fc4-1732280779013	2024-11-22 14:06:19.016503+01	2024-11-22 14:06:19.016503+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
7e7b2257-b094-45e7-8d9b-3c4fbc28a065	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	500.00	debit	2024-11-22	completed	test	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-af8526fdbf-1732280826377	2024-11-22 14:07:06.378758+01	2024-11-22 14:07:06.378758+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
8c479003-1461-4142-879e-bd33c999f780	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	oya now	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-7367d857bf-1732280907629	2024-11-22 14:08:27.633621+01	2024-11-22 14:08:27.633621+01	\N	728130d4-2d65-4469-966d-174cbbd8a089	8699751545	2527615493	Fund Flow	Ayodeji Adebolu	\N	\N	\N	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d
37241da7-8329-4c74-b676-492a38844872	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	1000.00	debit	2024-11-22	completed	testing	e83afe03-c274-4b13-a35a-a7b1ce9a7d3e	ffw-1d400e-1732295591247	2024-11-22 18:13:11.253443+01	2024-11-22 18:13:11.253443+01	\N	\N	8699751545	0728453360	Access bank	AYODEJI OLUBUNMI ADEBOLU	\N	\N	\N	\N
\.


--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.transfers (id, from_account_id, to_account_id, amount, transfer_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.users (id, status, user_name, email, first_name, last_name, password, phone_number, two_fa_enabled, biometric_enabled, is_verified, is_updated, created_at, updated_at, is_phone_verified, profile_image, account_tier, role) FROM stdin;
7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	active	adeyod	ayodejiadebolu@gmail.com	Ayodeji	Adebolu	$2a$10$jHRc3PMFXITDwpEXMifMcOd81uLDcXeWRnuRyYFgZCdJ1yPt5RoHy	+2348100987235	f	f	t	f	2024-09-17 16:47:11.869363+01	2024-09-17 16:47:11.869363+01	f	{"url": "https://res.cloudinary.com/dgxyjw6q8/image/upload/v1730443531/FundFlow/wpunrpdq3gaitee1hxei.jpg", "public_id": "FundFlow/wpunrpdq3gaitee1hxei"}	basic	super_admin
64b0fb96-3b7b-41b0-b862-306c96a68e59	active	Folly	votinggivers@gmail.com	Fola	Adebolu	$2a$10$QI1RhlwSKEBhkULf8m5BIe5MJ.McmK6pCbQn.sJ0zrEMsaMnOP/gO	+2348100987235	f	f	t	f	2024-11-05 12:32:43.40775+01	2024-11-05 12:32:43.40775+01	f	\N	basic	customer
bd00e5ff-7758-4d9d-9387-ca58f9bad5fa	active	Ayomyom	adeniketolu86@gmail.com	Ayomide	Adebolu 	$2a$10$V8htlkd6hl6/jxS2640IDOwRKYnawSIR9yjV.6bBydJR9IKMkjqmK	+2348100987235	f	f	t	f	2024-11-05 12:09:00.015641+01	2024-11-05 12:09:00.015641+01	f	\N	basic	customer
138875b5-9a26-4402-9e3c-6ba7afe1e040	active	Ayoade	ourgallery247@gmail.com	Ayodeji	Adebolu	$2a$10$tO62PR9g4AM3nGSY6uGLdeUFYhevtOE0D86nLa40/zwtxzyxnPKBm	+2348100987235	f	f	t	f	2024-08-08 11:31:20.638776+01	2024-08-08 11:31:20.638776+01	f	{"url": "https://res.cloudinary.com/dgxyjw6q8/image/upload/v1732312630/FundFlow/rodzkke9oldnspsdl0xo.png", "public_id": "FundFlow/rodzkke9oldnspsdl0xo"}	basic	customer
\.


--
-- Data for Name: verification_code; Type: TABLE DATA; Schema: public; Owner: fintech_app_owner
--

COPY public.verification_code (id, user_id, token, expires_at, purpose, created_at, updated_at) FROM stdin;
9eb98335-ddee-4d2d-940b-417ef805162d	7c7cce96-11ca-4ab7-8f40-b1b83ef72e9d	896659771910088-AA	2024-09-17 17:20:21.195+01	password_reset	2024-09-17 17:01:21.970977+01	2024-09-17 17:01:21.970977+01
6140243b-aa9c-49d7-a7d6-e01f42ea9f5d	64b0fb96-3b7b-41b0-b862-306c96a68e59	744193	2024-11-05 16:05:38.047+01	password_reset	2024-11-05 17:09:52.667149+01	2024-11-05 17:09:52.667149+01
\.


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fintech_app_owner
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 28, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: fintech_app_owner
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: accounts accounts_account_number_unique; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_account_number_unique UNIQUE (account_number);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: kyc_verifications kyc_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.kyc_verifications
    ADD CONSTRAINT kyc_verifications_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_reference_number_unique; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_reference_number_unique UNIQUE (reference_number);


--
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_name_unique; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_name_unique UNIQUE (user_name);


--
-- Name: verification_code verification_code_pkey; Type: CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.verification_code
    ADD CONSTRAINT verification_code_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: kyc_verifications kyc_verifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.kyc_verifications
    ADD CONSTRAINT kyc_verifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_receiver_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_receiver_foreign FOREIGN KEY (receiver) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: otps otps_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_account_id_foreign FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transfers transfers_from_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_from_account_id_foreign FOREIGN KEY (from_account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: transfers transfers_to_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_to_account_id_foreign FOREIGN KEY (to_account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: verification_code verification_code_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: fintech_app_owner
--

ALTER TABLE ONLY public.verification_code
    ADD CONSTRAINT verification_code_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

