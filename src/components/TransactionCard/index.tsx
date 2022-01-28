import React from 'react';
import { View } from 'react-native';
import { categories } from '../../utils/categories';
import {
  Amount,
  Category,
  CategoryName,
  Container,
  Footer,
  Icon,
  Title,
  Date,
} from './style';

export interface TransactionCardProps {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface Props {
  data: TransactionCardProps;
}

const icon = {
  up: 'arrow-up-circle',
  down: 'arrow-down-circle',
  total: 'dollar-sign',
};

export function TransactionCard({ data }: Props) {
  const category = categories.filter((item) => item.key === data.category)[0];
  return (
    <Container>
      <Title>{data.name}</Title>
      <Amount type={data.type}>
        {data.type === 'negative' && '- '}
        {data.amount}
      </Amount>
      <Footer>
        <Category>
          <Icon name={category.icon} />
          <CategoryName>{category.name}</CategoryName>
        </Category>
        <Date>{data.date}</Date>
      </Footer>
    </Container>
  );
}
