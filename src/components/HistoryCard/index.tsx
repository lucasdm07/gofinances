import React from 'react';
import { Amount, Container, Title } from './styles';

interface Props {
  title: string;
  color: string;
  amount: string;
}

export function HistoryCard({ amount, title, color }: Props) {
  return (
    <Container color={color}>
      <Title>{title}</Title>
      <Amount>{amount}</Amount>
    </Container>
  );
}
