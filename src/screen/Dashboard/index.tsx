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
  LoadContainer,
} from './styles';

import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import theme from '../../global/styles/theme';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensive: HighlightProps;
  total: HighlightProps;
}

function getLastTransactionDate(
  collection: DataListProps[],
  type: 'positive' | 'negative'
): string {
  const lastTransactions = new Date(
    Math.max.apply(
      Math,
      collection
        .filter((transaction: DataListProps) => transaction.type === type)
        .map((transaction: DataListProps) =>
          new Date(transaction.date).getTime()
        )
    )
  );
  return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString(
    'pt-BR',
    { month: 'long' }
  )}`;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );

  async function loadTransactions() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;
    let total = 0;

    const transactionsFormated: DataListProps[] = transactions.map(
      (item: DataListProps) => {
        switch (item.type) {
          case 'positive':
            entriesTotal += Number(item.amount);
            break;
          case 'negative':
            expensiveTotal += Number(item.amount);
          default:
            break;
        }

        total = entriesTotal - expensiveTotal;

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
    setTransactions(transactionsFormated);
    total = entriesTotal - expensiveTotal;

    const lastTransactionEntries = getLastTransactionDate(
      transactions,
      'positive'
    );
    const lastTransactionExpensive = getLastTransactionDate(
      transactions,
      'negative'
    );
    const totalInterval = `01 a ${lastTransactionExpensive}`;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: `??ltima entrada dia ${lastTransactionEntries}`,
      },
      expensive: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: `??ltima sa??da dia ${lastTransactionExpensive}`,
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: totalInterval,
      },
    });

    setIsLoading(false);
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
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size={'large'} />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: 'https://avatars.githubusercontent.com/u/44589860?v=4',
                  }}
                />
                <User>
                  <UserGreeting>Ol??, </UserGreeting>
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
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
            />
            <HighlightCard
              type={'down'}
              title={'Saidas'}
              amount={highlightData.expensive.amount}
              lastTransaction={highlightData.expensive.lastTransaction}
            />
            <HighlightCard
              type={'total'}
              title={'Total'}
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
            />
          </HighlightCards>
          <Transactions>
            <Title>Listagem</Title>
            <TransactionList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
