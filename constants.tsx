
import { Difficulty } from './types';

export const CURRICULUM = {
  [Difficulty.BEGINNER]: [
    { id: 'b1', title: 'A Escala Maior (Shape 1)' },
    { id: 'b2', title: 'Intervalos: A Base de Tudo' },
    { id: 'b3', title: 'Campo Harmônico Maior: Graus I, IV e V' },
    { id: 'b4', title: 'Relativa Menor e o VI Grau' },
    { id: 'b5', title: 'Acordes de Sétima: O Início do Jazz/Blues' }
  ],
  [Difficulty.INTERMEDIATE]: [
    { id: 'i1', title: 'Pentatônica e a Blue Note' },
    { id: 'i2', title: 'Tríades em Todo o Braço' },
    { id: 'i3', title: 'Campo Harmônico: Graus ii e iii' },
    { id: 'i4', title: 'O Modo Dórico' },
    { id: 'i5', title: 'Dominantes Secundários' }
  ],
  [Difficulty.ADVANCED]: [
    { id: 'a1', title: 'Modos Gregos Avançados' },
    { id: 'a2', title: 'Arpejos com Extensões (9, 11, 13)' },
    { id: 'a3', title: 'Escala Menor Melódica' },
    { id: 'a4', title: 'Empréstimo Modal' },
    { id: 'a5', title: 'Técnicas de Composição e Improviso' }
  ]
};
