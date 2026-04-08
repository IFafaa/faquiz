import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { QuestionType } from '../../../domain/value-objects/question-type.js';
import { SaveQuizTreeUseCase } from './save-quiz-tree.use-case.js';

describe('SaveQuizTreeUseCase', () => {
  const validTree = {
    rootNodeId: 'n1',
    nodes: [
      {
        id: 'n1',
        title: 'P1',
        description: '',
        questionType: QuestionType.MULTIPLE_CHOICE,
        positionX: 0,
        positionY: 0,
        answerOptions: [
          {
            id: 'o1',
            label: 'L',
            value: 'v',
            order: 0,
            nextQuestionNodeId: null,
          },
        ],
      },
    ],
  };

  it('validates and delegates to persistQuizTree', async () => {
    const repo: Pick<IQuizRepository, 'persistQuizTree'> = {
      persistQuizTree: jest.fn().mockResolvedValue(undefined),
    };
    const uc = new SaveQuizTreeUseCase(repo as IQuizRepository);
    await uc.execute('quiz-1', 'admin-1', validTree);
    expect(repo.persistQuizTree).toHaveBeenCalled();
  });

  it('fails when rootNodeId is not among nodes', () => {
    const repo: Pick<IQuizRepository, 'persistQuizTree'> = {
      persistQuizTree: jest.fn(),
    };
    const uc = new SaveQuizTreeUseCase(repo as IQuizRepository);
    expect(() =>
      uc.execute('quiz-1', 'admin-1', {
        rootNodeId: 'missing',
        nodes: validTree.nodes,
      }),
    ).toThrow(ValidationError);
    expect(repo.persistQuizTree).not.toHaveBeenCalled();
  });
});
