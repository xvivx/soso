import { useSelector } from 'react-redux';
import { Select, SelectProps } from '@components';
import { languageArr, setLang } from '@/i18n';

export default function I18nSelector(props: Omit<SelectProps<string>, 'value' | 'options' | 'onChange'>) {
  const language = useSelector((state) => state.system.lang);
  return <Select options={languageArr} value={language} onChange={setLang} {...props} />;
}
