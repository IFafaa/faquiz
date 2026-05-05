import { toPublicQuestion } from './to-public-question.js';

describe('toPublicQuestion', () => {
  it('returns null when node is null', () => {
    expect(toPublicQuestion(null)).toBeNull();
  });

  it('maps node and options to public shape', () => {
    const node = {
      id: 'n1',
      title: 'T',
      description: 'D',
      questionType: 'multiple_choice',
      answerOptions: [
        {
          id: 'o1',
          label: 'L',
          value: 'v',
          order: 0,
        },
      ],
    };
    expect(toPublicQuestion(node)).toEqual({
      id: 'n1',
      title: 'T',
      description: 'D',
      questionType: 'multiple_choice',
      answerOptions: [
        { id: 'o1', label: 'L', value: 'v', order: 0 },
      ],
    });
  });
});
