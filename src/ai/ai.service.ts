import { Injectable } from '@nestjs/common';
import { GenerateTrainingAiDto } from './dto/generate-training-ai.dto';
import { AiTrainingDraftDto } from './dto/ai-training-draft.dto';

@Injectable()
export class AiService {
  async generateTrainingDraft(dto: GenerateTrainingAiDto): Promise<AiTrainingDraftDto> {
    const focus = (dto.focus || '').toLowerCase();

    const baseName = `Treino ${dto.goal} (${dto.daysPerWeek}x/sem)`;
    const description = [
      `Nível: ${dto.level}`,
      dto.sessionMinutes ? `Duração: ${dto.sessionMinutes} min` : null,
      dto.focus ? `Foco: ${dto.focus}` : null,
      dto.restrictions ? `Restrições: ${dto.restrictions}` : null,
    ].filter(Boolean).join(' • ');

    const exercises =
      focus.includes('peito')
        ? [
            { name: 'Supino reto (barra)', sets: 4, reps: '12-10-8-8', technique: 'Pirâmide leve', order: 0 },
            { name: 'Supino inclinado (halteres)', sets: 4, reps: '10-10-8-8', technique: 'Excêntrica 3s', order: 1 },
            { name: 'Crucifixo (cabo)', sets: 3, reps: '12-15', technique: 'Pico 2s', order: 2 },
            { name: 'Tríceps corda', sets: 3, reps: '12-12-10', technique: 'Sem balançar', order: 3 },
            { name: 'Tríceps testa (barra W)', sets: 3, reps: '10-10-8', technique: 'Cotovelos fixos', order: 4 },
          ]
        : [
            { name: 'Agachamento (guiado)', sets: 4, reps: '12-10-10-8', technique: 'Amplitude controlada', order: 0 },
            { name: 'Leg press', sets: 4, reps: '12-12-10-10', technique: 'Sem travar joelho', order: 1 },
            { name: 'Cadeira extensora', sets: 3, reps: '12-15', technique: 'Drop-set final', order: 2 },
            { name: 'Mesa flexora', sets: 3, reps: '10-12', technique: 'Pico 1s', order: 3 },
            { name: 'Panturrilha em pé', sets: 4, reps: '12-15', technique: 'Pausa 1s em cima', order: 4 },
          ];

    return {
      name: baseName,
      description,
      exercises: exercises.map((e) => ({ ...e, targetWeight: undefined })),
    };
  }
} // ✅ ESSA CHAVE ESTAVA FALTANDO
