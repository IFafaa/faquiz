import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL é obrigatório para o seed');
}
const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

const QUESTIONS: { title: string; description: string }[] = [
  {
    title: 'Termo de consentimento livre e esclarecido (TCLE)',
    description: [
      '<p>Você está sendo convidado a participar de uma <strong>pesquisa acadêmica</strong> sobre as percepções sociais e o uso de <strong>cigarros eletrônicos</strong> entre jovens da <strong>Geração Z</strong>. Esta pesquisa está sendo realizada por estudantes da faculdade <strong>ESAMC Uberlândia</strong>, por meio da disciplina <strong>Pesquisa de Mercado</strong>, para fins <strong>exclusivamente acadêmicos</strong>.</p>',
      '<p>A participação consiste em responder a um questionário rápido, que leva aproximadamente <strong>3 a 5 minutos</strong> para ser concluído.</p>',
      '<p>Sua participação é <strong>voluntária</strong> e <strong>anônima</strong>, ou seja, nenhuma informação que permita sua identificação será coletada. Você pode optar por encerrar sua participação a qualquer momento, sem qualquer prejuízo.</p>',
      '<p>As respostas serão utilizadas apenas para <strong>análise acadêmica</strong> e elaboração de trabalho científico, podendo ser apresentadas de forma agrupada e sem identificação individual.</p>',
      '<p>Ao selecionar a opção <strong>&quot;Sim, eu concordo&quot;</strong>, você declara que leu e compreendeu as informações acima e aceita participar da pesquisa.</p>',
      '<p>Você concorda em participar desta pesquisa?</p>',
    ].join(''),
  },
  {
    title: 'Em que ano você nasceu?',
    description: '',
  },
  {
    title: 'Qual o gênero que você se identifica?',
    description: '',
  },
  {
    title:
      'Você já ouviu falar em cigarros eletrônicos/vapes/pods/narguile/juul?',
    description: '',
  },
  {
    title:
      'Você acha que o cigarro eletrônico é considerado uma droga no Brasil de acordo com a ANVISA (Agência Nacional de Vigilância Sanitária)?',
    description: '',
  },
  {
    title:
      'Você acha que o cigarro eletrônico é considerado um produto ilícito no Brasil de acordo com a ANVISA (Agência Nacional de Vigilância Sanitária)?',
    description: '',
  },
  {
    title: 'O uso de cigarro eletrônico é comum no seu grupo social?',
    description: '',
  },
  {
    title:
      'Você já foi influenciado de alguma forma direta a usar cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você já fez uso de cigarro eletrônico?',
    description:
      '',
  },
  {
    title: 'Com que frequência você utiliza cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Com que idade você fez o primeiro uso de cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Antes do seu primeiro uso de cigarro eletrônico, você fez uso de cigarro branco?',
    description: '',
  },
  {
    title: 'O cigarro eletrônico foi seu primeiro contato com o fumo?',
    description: '',
  },
  {
    title:
      'Você percebe que o seu uso ocorre com maior frequência quando você…',
    description: '',
  },
  {
    title:
      'Você percebe que o seu uso ocorre com maior frequência quando você…',
    description: '',
  },
  {
    title:
      'Você percebe que o seu uso ocorre com maior frequência quando você…',
    description: '',
  },
  {
    title:
      'Você já gastou dinheiro na compra de um cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você já usou um cigarro eletrônico emprestado de outra pessoa?',
    description: '',
  },
  {
    title:
      'O seu uso ocorre em maior frequência por meio de um produto próprio ou por meio de um produto emprestado de outra pessoa?',
    description: '',
  },
  {
    title:
      'Você já fez uso de cigarro eletrônico acompanhado de bebidas alcoólicas?',
    description: '',
  },
  {
    title:
      'Você já fez uso de cigarro eletrônico acompanhado de outras substâncias ilícitas?',
    description: '',
  },
  {
    title:
      'Você já se sentiu julgado de alguma forma por alguém por fazer uso de cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você já teve que omitir ou mentir que você faz uso de cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você já viu conteúdos sobre cigarro eletrônico em redes sociais?',
    description: '',
  },
  {
    title:
      'Esses conteúdos influenciaram sua opinião (positivamente ou negativamente) sobre o cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'A opinião de influenciadores digitais impactam sua visão (positivamente ou negativamente) sobre o uso do cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você considera o cigarro eletrônico prejudicial à saúde?',
    description: '',
  },
  {
    title:
      'Comparado ao cigarro tradicional, você acha o cigarro eletrônico:',
    description: '',
  },
  {
    title:
      'Você acredita que o cigarro eletrônico está associado à estilos de vida específicos?',
    description: '',
  },
  {
    title:
      'Você seria próximo de uma pessoa que usa cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você seria próximo de uma pessoa que julga o uso de cigarro eletrônico?',
    description: '',
  },
  {
    title:
      'Você acredita que o uso de cigarro eletrônico pode influenciar a aceitação de alguém em grupos sociais?',
    description: '',
  },
  {
    title:
      'Você acredita que alguém pode usar cigarro eletrônico por pressão social?',
    description: '',
  },
];

const QUIZ_TITLE =
  'Pesquisa Gen Z — Percepções e uso de cigarro eletrônico (ESAMC Uberlândia)';
const QUIZ_DESCRIPTION =
  'Pesquisa acadêmica da disciplina Pesquisa de Mercado.';

const SEED_QUIZ_ID = 'cafebabe-0000-4000-8000-00000000a001';

async function main() {
  const alreadySeeded = await prisma.quiz.findUnique({
    where: { id: SEED_QUIZ_ID },
  });
  if (alreadySeeded) {
    console.log(
      'Seed ignorado: banco já contém o quiz inicial (execução única).',
    );
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (isProd && !adminSeedPassword) {
    console.warn(
      'Seed ignorado em produção: defina ADMIN_SEED_PASSWORD (segredo forte) para criar o usuário seed e o quiz na primeira execução.',
    );
    return;
  }

  if (!adminSeedPassword) {
    throw new Error(
      'ADMIN_SEED_PASSWORD não configurado. Defina a variável de ambiente para criar o usuário seed inicial.',
    );
  }
  const plainPassword = adminSeedPassword;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@faquiz.com' },
    update: {},
    create: {
      email: 'admin@faquiz.com',
      password: hashedPassword,
      name: 'Usuário demo',
    },
  });

  await prisma.quiz.deleteMany({
    where: { title: QUIZ_TITLE, userId: user.id },
  });

  const quiz = await prisma.quiz.create({
    data: {
      id: SEED_QUIZ_ID,
      title: QUIZ_TITLE,
      description: QUIZ_DESCRIPTION,
      isPublished: true,
      collectName: false,
      collectEmail: false,
      collectPhone: false,
      userId: user.id,
    },
  });

  const nodeIds: string[] = [];
  for (const q of QUESTIONS) {
    const n = await prisma.questionNode.create({
      data: {
        quizId: quiz.id,
        title: q.title,
        description: q.description,
        questionType: 'multiple_choice',
        positionX: 0,
        positionY: 0,
      },
    });
    nodeIds.push(n.id);
  }

  const n = (i: number) => nodeIds[i];

  await prisma.quiz.update({
    where: { id: quiz.id },
    data: { rootNodeId: n(0) },
  });

  type Opt = {
    label: string;
    value: string;
    order: number;
    nextIdx: number | null;
  };

  const addOpts = (questionIndex: number, options: Opt[]) =>
    prisma.answerOption.createMany({
      data: options.map((o) => ({
        questionNodeId: n(questionIndex),
        label: o.label,
        value: o.value,
        order: o.order,
        nextQuestionNodeId: o.nextIdx == null ? null : n(o.nextIdx),
      })),
    });

  await addOpts(0, [
    { label: 'Sim, eu concordo', value: 'consent_yes', order: 0, nextIdx: 1 },
    {
      label: 'Não, eu não concordo',
      value: 'consent_no',
      order: 1,
      nextIdx: null,
    },
  ]);

  await addOpts(1, [
    {
      label: 'Anterior a 1996',
      value: 'birth_before_1996',
      order: 0,
      nextIdx: 2,
    },
    {
      label: '1997 – 2006',
      value: 'birth_1997_2006',
      order: 1,
      nextIdx: 2,
    },
    {
      label: '2007 – 2012',
      value: 'birth_2007_2012',
      order: 2,
      nextIdx: 2,
    },
    {
      label: 'Posterior a 2012',
      value: 'birth_after_2012',
      order: 3,
      nextIdx: 2,
    },
  ]);

  await addOpts(2, [
    { label: 'Masculino', value: 'gender_m', order: 0, nextIdx: 3 },
    { label: 'Feminino', value: 'gender_f', order: 1, nextIdx: 3 },
    { label: 'Outro', value: 'gender_other', order: 2, nextIdx: 3 },
    {
      label: 'Prefiro não informar',
      value: 'gender_na',
      order: 3,
      nextIdx: 3,
    },
  ]);

  await addOpts(3, [
    { label: 'Sim', value: 'heard_yes', order: 0, nextIdx: 4 },
    { label: 'Não', value: 'heard_no', order: 1, nextIdx: 4 },
  ]);
  await addOpts(4, [
    { label: 'Sim', value: 'anvisa_drug_yes', order: 0, nextIdx: 5 },
    { label: 'Não', value: 'anvisa_drug_no', order: 1, nextIdx: 5 },
  ]);
  await addOpts(5, [
    { label: 'Sim', value: 'anvisa_illicit_yes', order: 0, nextIdx: 6 },
    { label: 'Não', value: 'anvisa_illicit_no', order: 1, nextIdx: 6 },
  ]);
  await addOpts(6, [
    { label: 'Sim', value: 'social_common_yes', order: 0, nextIdx: 7 },
    { label: 'Não', value: 'social_common_no', order: 1, nextIdx: 7 },
    { label: 'Não sei', value: 'social_common_dk', order: 2, nextIdx: 7 },
  ]);
  await addOpts(7, [
    { label: 'Sim', value: 'influenced_yes', order: 0, nextIdx: 8 },
    { label: 'Não', value: 'influenced_no', order: 1, nextIdx: 8 },
  ]);

  await addOpts(8, [
    { label: 'Sim', value: 'ever_used_yes', order: 0, nextIdx: 9 },
    { label: 'Não', value: 'ever_used_no', order: 1, nextIdx: 23 },
  ]);

  await addOpts(9, [
    {
      label: 'Menos que uma vez por ano',
      value: 'freq_lt_1_year',
      order: 0,
      nextIdx: 10,
    },
    {
      label: '1–5 vezes por ano',
      value: 'freq_1_5_year',
      order: 1,
      nextIdx: 10,
    },
    {
      label: '1–5 vezes por semestre',
      value: 'freq_1_5_sem',
      order: 2,
      nextIdx: 10,
    },
    {
      label: '1–5 vezes por mês',
      value: 'freq_1_5_month',
      order: 3,
      nextIdx: 10,
    },
    {
      label: '1–5 vezes por semana',
      value: 'freq_1_5_week',
      order: 4,
      nextIdx: 10,
    },
    {
      label: 'Mais que 5 vezes por semana',
      value: 'freq_gt_5_week',
      order: 5,
      nextIdx: 10,
    },
  ]);

  await addOpts(10, [
    {
      label: 'Menor que 12 anos',
      value: 'age_first_lt_12',
      order: 0,
      nextIdx: 11,
    },
    {
      label: 'Entre 12 e 14 anos',
      value: 'age_first_12_14',
      order: 1,
      nextIdx: 11,
    },
    {
      label: 'Entre 15 e 16 anos',
      value: 'age_first_15_16',
      order: 2,
      nextIdx: 11,
    },
    {
      label: 'Entre 17 e 18 anos',
      value: 'age_first_17_18',
      order: 3,
      nextIdx: 11,
    },
    {
      label: 'Maior que 19 anos',
      value: 'age_first_gt_19',
      order: 4,
      nextIdx: 11,
    },
    {
      label: 'Não lembro',
      value: 'age_first_dk',
      order: 5,
      nextIdx: 11,
    },
  ]);

  await addOpts(11, [
    { label: 'Sim', value: 'white_before_yes', order: 0, nextIdx: 12 },
    { label: 'Não', value: 'white_before_no', order: 1, nextIdx: 12 },
  ]);
  await addOpts(12, [
    { label: 'Sim', value: 'first_smoke_ecig_yes', order: 0, nextIdx: 13 },
    { label: 'Não', value: 'first_smoke_ecig_no', order: 1, nextIdx: 13 },
  ]);
  await addOpts(13, [
    { label: 'Está sozinho', value: 'ctx_alone', order: 0, nextIdx: 14 },
    { label: 'Está em grupo', value: 'ctx_group', order: 1, nextIdx: 14 },
  ]);
  await addOpts(14, [
    { label: 'Está em casa', value: 'ctx_home', order: 0, nextIdx: 15 },
    { label: 'Está fora de casa', value: 'ctx_out', order: 1, nextIdx: 15 },
  ]);
  await addOpts(15, [
    {
      label: 'Está estressado',
      value: 'ctx_stressed',
      order: 0,
      nextIdx: 16,
    },
    { label: 'Está feliz', value: 'ctx_happy', order: 1, nextIdx: 16 },
    {
      label: 'Está em outra situação',
      value: 'ctx_other',
      order: 2,
      nextIdx: 16,
    },
  ]);
  await addOpts(16, [
    { label: 'Sim', value: 'spent_money_yes', order: 0, nextIdx: 17 },
    { label: 'Não', value: 'spent_money_no', order: 1, nextIdx: 17 },
  ]);
  await addOpts(17, [
    { label: 'Sim', value: 'borrowed_use_yes', order: 0, nextIdx: 18 },
    { label: 'Não', value: 'borrowed_use_no', order: 1, nextIdx: 18 },
  ]);
  await addOpts(18, [
    {
      label: 'Por produto próprio',
      value: 'own_product',
      order: 0,
      nextIdx: 19,
    },
    {
      label: 'Por produto emprestado de outra pessoa',
      value: 'borrowed_product',
      order: 1,
      nextIdx: 19,
    },
    {
      label: 'A frequência dessas duas formas é igual',
      value: 'own_borrow_equal',
      order: 2,
      nextIdx: 19,
    },
  ]);
  await addOpts(19, [
    { label: 'Sim', value: 'with_alcohol_yes', order: 0, nextIdx: 20 },
    { label: 'Não', value: 'with_alcohol_no', order: 1, nextIdx: 20 },
  ]);
  await addOpts(20, [
    { label: 'Sim', value: 'with_drugs_yes', order: 0, nextIdx: 21 },
    { label: 'Não', value: 'with_drugs_no', order: 1, nextIdx: 21 },
  ]);
  await addOpts(21, [
    { label: 'Sim', value: 'judged_yes', order: 0, nextIdx: 22 },
    { label: 'Não', value: 'judged_no', order: 1, nextIdx: 22 },
  ]);
  await addOpts(22, [
    { label: 'Sim', value: 'lied_yes', order: 0, nextIdx: 23 },
    { label: 'Não', value: 'lied_no', order: 1, nextIdx: 23 },
  ]);

  await addOpts(23, [
    { label: 'Sim', value: 'social_content_yes', order: 0, nextIdx: 24 },
    { label: 'Não', value: 'social_content_no', order: 1, nextIdx: 24 },
  ]);
  await addOpts(24, [
    {
      label: 'Sim',
      value: 'content_influenced_yes',
      order: 0,
      nextIdx: 25,
    },
    {
      label: 'Não',
      value: 'content_influenced_no',
      order: 1,
      nextIdx: 25,
    },
    {
      label: 'Parcialmente',
      value: 'content_influenced_partial',
      order: 2,
      nextIdx: 25,
    },
  ]);
  await addOpts(25, [
    {
      label: 'Sim',
      value: 'influencers_impact_yes',
      order: 0,
      nextIdx: 26,
    },
    {
      label: 'Não',
      value: 'influencers_impact_no',
      order: 1,
      nextIdx: 26,
    },
    {
      label: 'Parcialmente',
      value: 'influencers_impact_partial',
      order: 2,
      nextIdx: 26,
    },
  ]);
  await addOpts(26, [
    {
      label: 'Sim',
      value: 'harmful_yes',
      order: 0,
      nextIdx: 27,
    },
    { label: 'Não', value: 'harmful_no', order: 1, nextIdx: 27 },
    {
      label: 'Parcialmente',
      value: 'harmful_partial',
      order: 2,
      nextIdx: 27,
    },
  ]);
  await addOpts(27, [
    {
      label: 'Mais prejudicial à saúde',
      value: 'vs_trad_more',
      order: 0,
      nextIdx: 28,
    },
    {
      label: 'Menos prejudicial à saúde',
      value: 'vs_trad_less',
      order: 1,
      nextIdx: 28,
    },
    {
      label: 'Nível de prejuízo igual à saúde',
      value: 'vs_trad_equal',
      order: 2,
      nextIdx: 28,
    },
    { label: 'Não sei', value: 'vs_trad_dk', order: 3, nextIdx: 28 },
  ]);
  await addOpts(28, [
    { label: 'Sim', value: 'lifestyle_yes', order: 0, nextIdx: 29 },
    { label: 'Não', value: 'lifestyle_no', order: 1, nextIdx: 29 },
    { label: 'Talvez', value: 'lifestyle_maybe', order: 2, nextIdx: 29 },
  ]);
  await addOpts(29, [
    { label: 'Sim', value: 'close_user_yes', order: 0, nextIdx: 30 },
    { label: 'Não', value: 'close_user_no', order: 1, nextIdx: 30 },
    { label: 'Talvez', value: 'close_user_maybe', order: 2, nextIdx: 30 },
  ]);
  await addOpts(30, [
    { label: 'Sim', value: 'close_judge_yes', order: 0, nextIdx: 31 },
    { label: 'Não', value: 'close_judge_no', order: 1, nextIdx: 31 },
    { label: 'Talvez', value: 'close_judge_maybe', order: 2, nextIdx: 31 },
  ]);
  await addOpts(31, [
    {
      label: 'Sim',
      value: 'social_accept_yes',
      order: 0,
      nextIdx: 32,
    },
    {
      label: 'Não',
      value: 'social_accept_no',
      order: 1,
      nextIdx: 32,
    },
    {
      label: 'Talvez',
      value: 'social_accept_maybe',
      order: 2,
      nextIdx: 32,
    },
  ]);
  await addOpts(32, [
    {
      label: 'Sim',
      value: 'peer_pressure_yes',
      order: 0,
      nextIdx: null,
    },
    {
      label: 'Não',
      value: 'peer_pressure_no',
      order: 1,
      nextIdx: null,
    },
    {
      label: 'Talvez',
      value: 'peer_pressure_maybe',
      order: 2,
      nextIdx: null,
    },
  ]);

  console.log('Seed OK.');
  if (isProd) {
    console.log('Usuário seed:', user.email, '(senha definida por ADMIN_SEED_PASSWORD)');
  } else {
    console.log('Usuário seed:', user.email, '(senha seed local: admin123)');
  }
  console.log('Quiz título:', QUIZ_TITLE);
  console.log('Quiz ID (use na URL pública):', quiz.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
