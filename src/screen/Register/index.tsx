import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from 'react-native';
import { CategorySelectButton } from '../../components/CategorySelectButton';
import { Button } from '../../components/Forms/Button';
import { InputForm } from '../../components/InputForm';
import { TransactionTypeButton } from '../../components/TransactionTypeButton';
import { Category, CategorySelect } from '../CategorySelect';
import {
  Container,
  Header,
  Title,
  Form,
  TransactionsTypes,
  Fields,
} from './styles';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';

interface FormData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  amount: Yup.number()
    .typeError('Informe um valor númerico')
    .positive('O valor não pode ser negativo')
    .required('O Valor é obrigatório'),
});

export function Register() {
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const { navigate }: NavigationProp<ParamListBase> = useNavigation();

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleTransactionsTypeSelect = (type: 'positive' | 'negative') => {
    setTransactionType(type);
  };

  const handleCloseSelectCategoryModal = () => {
    setCategoryModalOpen(false);
  };

  const handleOpenSelectCategoryModal = () => {
    setCategoryModalOpen(true);
  };

  const handleSetCategory = (item: Category) => {
    setCategory(item);
  };
  const dataKey = '@gofinances:transactions';
  const handleRegister = async (form: FormData) => {
    if (!transactionType) return Alert.alert('Selecione o tipo de transação');
    if (category.key === 'category')
      return Alert.alert('Selecione a categoria');

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date(),
    };

    try {
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];
      const dataFormated = [...currentData, newTransaction];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormated));

      reset();
      setTransactionType('');
      setCategory({
        key: 'category',
        name: 'Categoria',
      });
      navigate('Listagem');
    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possível salvar');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>
        <Form>
          <Fields>
            <InputForm
              autoCapitalize={'sentences'}
              autoCorrect={false}
              name={'name'}
              control={control}
              placeholder='Nome'
              error={errors.name && errors.name.message}
            />
            <InputForm
              name={'amount'}
              control={control}
              placeholder='Preço'
              keyboardType='numeric'
              error={errors.amount && errors.amount.message}
            />
            <TransactionsTypes>
              <TransactionTypeButton
                title='Income'
                type='up'
                isActive={transactionType === 'positive'}
                onPress={() => handleTransactionsTypeSelect('positive')}
              />
              <TransactionTypeButton
                title='Outcome'
                type='down'
                isActive={transactionType === 'negative'}
                onPress={() => handleTransactionsTypeSelect('negative')}
              />
            </TransactionsTypes>
            <CategorySelectButton
              title={category.name}
              onPress={handleOpenSelectCategoryModal}
            />
          </Fields>
          <Button title={'Enviar'} onPress={handleSubmit(handleRegister)} />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={handleSetCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
