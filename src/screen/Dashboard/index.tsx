import React, { useCallback, useEffect, useState } from 'react';
import { HighlightCard } from '../../components/HighlightCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';

import {
  Container,
  Header,
  HighlightCards,
  Icon,
  Photo,
  User,
  UserGreeting,
  UserInfo,
  UserName,
  UserWrapper,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
} from './styles';

import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import { useFocusEffect } from '@react-navigation/native';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

export function Dashboard() {
  const [data, setData] = useState<DataListProps[]>([]);

  async function loadTransactions() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    const transactionsFormated: DataListProps[] = transactions.map(
      (item: DataListProps) => {
        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        };
      }
    );

    setData(transactionsFormated);
  }

  // useEffect(() => {
  //   async function removeAll() {
  //     const dataKey = '@gofinances:transactions';
  //     const data = await AsyncStorage.removeItem(dataKey);
  //     console.log('lista limpa');
  //   }
  //   removeAll();
  // }, []);

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo
              source={{
                uri: 'https://avatars.githubusercontent.com/u/44589860?v=4',
              }}
            />
            <User>
              <UserGreeting>Olá, </UserGreeting>
              <UserName>Lucas</UserName>
            </User>
          </UserInfo>
          <LogoutButton onPress={() => {}}>
            <Icon name='power' />
          </LogoutButton>
        </UserWrapper>
      </Header>
      <HighlightCards>
        <HighlightCard
          type={'up'}
          title={'Entradas'}
          amount={'R$ 17.400,00'}
          lastTransaction={'Última entrada dia 13 de abril'}
        />
        <HighlightCard
          type={'down'}
          title={'Entradas'}
          amount={'R$ 1.259,00'}
          lastTransaction={'Última saída dia 03 de abril'}
        />
        <HighlightCard
          type={'total'}
          title={'total'}
          amount={'R$ 16.141,00'}
          lastTransaction={'01 à 16 de abril'}
        />
      </HighlightCards>
      <Transactions>
        <Title>Listagem</Title>
        <TransactionList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />
      </Transactions>
    </Container>
  );
}
