import React from 'react';
import ReactDOM from 'react-dom';
import {
  View, Panel, PanelHeader, Group, List, Cell, Avatar, Footer,
  HeaderButton, CellButton, Root, PanelHeaderContent, Epic, platform,
  Tabbar, TabbarItem, Search, Input, FormLayout, Button, InfoRow,
  Select, IOS, Tabs, TabsItem, Div, Progress, Checkbox, FixedLayout
} from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon24DoneOutline from '@vkontakte/icons/dist/24/done_outline';
import Icon24Settings from '@vkontakte/icons/dist/24/settings';
import Icon28Menu from '@vkontakte/icons/dist/28/menu';
import Icon24Poll from '@vkontakte/icons/dist/24/poll';
import Icon28Write from '@vkontakte/icons/dist/28/write';
import Icon24Users from '@vkontakte/icons/dist/24/users';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import Icon28User from '@vkontakte/icons/dist/28/user';
import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import '@vkontakte/vkui/dist/vkui.css';
import * as connect from '@vkontakte/vkui-connect';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Icon16Done from '@vkontakte/icons/dist/16/done';
import YouTube from 'react-youtube';

let api_data = {}

const instance = axios.create({
  headers: { 'Access-Control-Allow-Origin': "*" }
});

const youtube_opts = {
  height: '210',
  width: '390'
};

const osname = platform();
connect.send("VKWebAppInit", {});

class ChallengeInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: 0
    }
  }

  joinChallenge(id, ch_id) {
    instance.post('http://192.168.43.150:5000/join_challenge', {
      user_id: id,
      challenge_id: ch_id
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  removeChallenge(id, ch_id) {
    instance.post('http://192.168.43.150:5000/remove_challenge', {
      user_id: id,
      challenge_id: ch_id
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  getApiData(type, value) {
    if (type === "Хештег" || type === "Репост" || type === "Хештег и фото" || type === "Отметка пользователя") {
      connect.send("VKWebAppCallAPIMethod", {
        "method": "wall.get",
        "request_id": "hashtag",
        "params": { "count": 10, "v": "5.101", "access_token": this.props.token }
      });
    }
    else if (type === "Подписка") {
      connect.send("VKWebAppCallAPIMethod", {
        "method": "groups.getById",
        "request_id": "sub",
        "params": { "group_id": value.split("/")[value.split("/").length - 1], "v": "5.101", "access_token": this.props.token }
      });
    }
    else if (type === "Лайк") {
      connect.send("VKWebAppCallAPIMethod", {
        "method": "likes.isLiked",
        "request_id": "like",
        "params": {
          "user_id": this.props.user_id, "type": "post", "owner_id": value.split("w=wall")[value.split("w=wall").length - 1].split("_")[0],
          "item_id": value.split("w=wall")[value.split("w=wall").length - 1].split("_")[1], "v": "5.101", "access_token": this.props.token
        }
      });
    }
  }


  render() {
    return (
      <React.Fragment>
        <PanelHeader left={<HeaderButton >{<Icon24Back />}</HeaderButton>}> {this.props.name}</PanelHeader>
        <img style={{ maxWidth: "370px" }} src={this.props.cover} />
        <Group title="Описание">
          <Cell multiline>{this.props.desc}</Cell>
        </Group>
        <Group title="Кол-во участников">
          <Cell multiline>{this.props.challenge.participants.length}</Cell>
        </Group>
        <Group>
          <Group title="Задания">
            <List>
              {this.props.tasks.map((task, index) =>
                <Cell
                  multiline
                  asideContent={<Button onClick={() => { this.getApiData(task.type, task.value); api_data.index = index; api_data.id = this.props.challenge._id }} before={<Icon16Done />}>Я сделал</Button>}
                  description={task.description}
                >
                  Задание {index}
                </Cell>
              )}
            </List>
            <Group>
              <FormLayout>
                <Button onClick={() => { this.joinChallenge(this.props.user_id, this.props.challenge._id) }} size="xl">Участвую</Button>
              </FormLayout>
            </Group>
          </Group>

        </Group>
      </React.Fragment>
    );
  }
}

class VKchallenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name_task: "",
      desc_task: "",
      value_task: "",
      name: "",
      desc: "",
      complete: "",
      hash: "",
      publ: "",
      community: "My account",
      winner: "",
      cover: "",
      category: "",
      main: "",

      activeStory: 'feed',
      activeView: "view1",
      activeTab6: "active",
      activeTab5: "popular",
      activeTab10: "main_challenge",
      challenge_obj: {},
      all_challenges: [],
      user_groups: [],
      challenges: {},
      user_obj: { connected_groups: [] },
      one_challenge_obj: {},
      user_obj_vk: {},
      task_list: [],
      token: "",
      posted_community: "",
      edit_challenge_id: "",
      edit: false
    };
    this.onChange = this.onChange.bind(this);
    this.onStoryChange = this.onStoryChange.bind(this);
    this.select = this.select.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({
      activeStory: "more"
    })
  }

  onStoryChange(e) {
    this.setState({ activeStory: e.currentTarget.dataset.story })
  }

  select(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setState({ mode });
    // requestAnimationFrame(this.toggleContext);
  }

  componentDidMount() {
    connect.send("VKWebAppSetLocation", { "location": "hash" });
    this.getMain();
    connect.subscribe((e) => {
      console.log(window.location.hash);
      if (e.detail.type === "VKWebAppGetUserInfoResult") {
        this.state.user_obj_vk = e.detail.data;
        this.getUser();
        this.getChallenges();
      }
      else if (e.detail.type === "VKWebAppAccessTokenReceived") {
        this.state.token = e.detail.data.access_token;
        connect.send("VKWebAppCallAPIMethod", {
          "method": "groups.get",
          "request_id": "groups.get",
          "params": { extended: 1, "user_id": this.state.user_obj_vk.id, "v": "5.101", filter: "admin", count: 1000, "access_token": this.state.token }
        });
      }
      else if (e.detail.type === "VKWebAppCallAPIMethodFailed") {
        alert(JSON.stringify(e.detail, null, 4))
      }
      else if (e.detail.type === "VKWebAppCallAPIMethodResult") {
        if (e.detail.data.request_id === "groups.get") {
          this.setState({ user_groups: e.detail.data.response.items })
        }
        else if (e.detail.data.request_id === "posted_community") {
          this.setState({ posted_community: e.detail.data.response })
          this.postChallenge();
        }
        else if (e.detail.data.request_id === "hashtag" || e.detail.data.request_id === "sub" || e.detail.data.request_id === "like") {
          instance.post('http://192.168.43.150:5000/check_task', {
            user_id: this.state.user_obj_vk.id.toString(),
            challenge_id: api_data.id,
            api_data: e.detail.data.response,
            task_index: api_data.index
          })
            .then(function (response) {
              if (response.data.result) {
                alert("Задание пройдено")
              }
              else {
                alert("Попробуйте еще раз")
              }
              if (response.data.error) {
                alert(response.data.error);
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        // { alert(JSON.stringify(e.detail, null, 4)) }
      }
    });
    connect.send("VKWebAppGetUserInfo", {});
    connect.send("VKWebAppGetAuthToken", { "app_id": 7138408, "scope": "groups,friends" });
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.activeStory !== this.state.activeStory) {
      this.getUser();
      this.getChallenges();
      this.getAllChallenges();
    }
  }

  getUser() {
    instance.get(`http://192.168.43.150:5000/get_user_info?user_id=${this.state.user_obj_vk.id.toString()}`)
      .then((response) => {
        this.setState({ user_obj: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getGroupById(id) {
    if (this.state.community === "My account") {
      this.postChallenge();
      return;
    }
    connect.send("VKWebAppCallAPIMethod", {
      "method": "groups.getById",
      "request_id": "posted_community",
      "params": { "group_id": parseInt(id) * -1, "v": "5.101", "access_token": this.state.token }
    });
  }

  getAllChallenges() {
    instance.get(`http://192.168.43.150:5000/get_challenge_list?status=ALL`)
      .then((response) => {
        response.data.result.sort((a, b) => (a.participants.length > b.participants.length) ? 1 : -1)
        this.setState({ all_challenges: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getChallenges() {
    instance.get(`http://192.168.43.150:5000/get_user_challenges?user_id=${this.state.user_obj_vk.id.toString()}`)
      .then((response) => {
        this.setState({ challenge_obj: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  postChallenge() {
    let f_name = this.state.user_obj_vk.first_name;
    let l_name = this.state.user_obj_vk.last_name;
    let u_photo = this.state.user_obj_vk.photo_100;

    if (this.state.community !== "My account") {
      f_name = this.state.posted_community[0].name;
      l_name = "";
      u_photo = this.state.posted_community[0].photo_100;
    }

    instance.post('http://192.168.43.150:5000/create_challenge', {
      user_id: this.state.user_obj_vk.id.toString(),
      name: this.state.name,
      description: this.state.desc,
      complete_message: this.state.complete,
      tasks: this.state.task_list,
      max_participants: this.state.max,
      challenge_hashtag: this.state.hash,
      group_publisher: this.state.community,
      winner: this.state.winner,
      cover: this.state.cover,
      category: this.state.category,

      first_name: f_name,
      last_name: l_name,
      user_photo: u_photo
    })
      .then(function (response) {
        alert(response.data.error);
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  editChallenge() {
    instance.post('http://192.168.43.150:5000/edit_challenge', {
      challenge_id: this.state.edit_challenge_id,
      kwargs: {
        name: this.state.name,
        description: this.state.desc,
        complete_message: this.state.complete,
        tasks: this.state.task_list,
        max_participants: this.state.max,
        challenge_hashtag: this.state.hash,
        winner: this.state.winner,
        cover: this.state.cover
      }
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  addGroup(id, name) {
    instance.post('http://192.168.43.150:5000/connect_group', {
      user_id: this.state.user_obj_vk.id.toString(),
      group_id: id,
      group_name: name
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  get_one_challenge(id) {
    instance.get(`http://192.168.43.150:5000/get_challenge_info?challenge_id=${id}`)
      .then((response) => {
        alert(JSON.stringify(response.data))
        this.setState({ one_challenge_obj: response.data.result });
        this.setState({ activeStory: 'challenge_info' })
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getMain() {
    instance.get(`http://192.168.43.150:5000/get_main_challenge`)
      .then((response) => {
        this.setState({ main: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  startChallenge(id) {
    instance.post('http://192.168.43.150:5000/start_challenge', {
      challenge_id: id
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  stopChallenge(id) {
    instance.post('http://192.168.43.150:5000/stop_challenge', {
      challenge_id: id
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  getApiData(type, value) {
    if (type === "Хештег" || type === "Репост" || type === "Хештег и фото" || type === "Отметка пользователя") {
      connect.send("VKWebAppCallAPIMethod", {
        "method": "wall.get",
        "request_id": "hashtag",
        "params": { "count": 10, "v": "5.101", "access_token": this.props.token }
      });
    }
    else if (type === "Подписка") {
      connect.send("VKWebAppCallAPIMethod", {
        "method": "groups.getById",
        "request_id": "sub",
        "params": { "group_id": value.split("/")[value.split("/").length - 1], "v": "5.101", "access_token": this.props.token }
      });
    }
    else if (type === "Лайк") {
      connect.send("VKWebAppCallAPIMethod", {
        "method": "likes.isLiked",
        "request_id": "like",
        "params": {
          "user_id": this.props.user_id, "type": "post", "owner_id": value.split("w=wall")[value.split("w=wall").length - 1].split("_")[0],
          "item_id": value.split("w=wall")[value.split("w=wall").length - 1].split("_")[1], "v": "5.101", "access_token": this.props.token
        }
      });
    }
  }

  restoreState(args) {
    this.setState({ name: args.name });
    this.setState({ desc: args.description });
    this.setState({ complete: args.complete_message });
    this.setState({ task_list: args.tasks });
    this.setState({ max: args.max_participants });
    this.setState({ hash: args.hashtag });
    this.setState({ community: args.group_publisher });
    this.setState({ winner: args.winner });
    this.setState({ cover: args.cover });
    this.setState({ hash: args.hashtag });
    this.setState({ edit_challenge_id: args._id });
  }

  resetState() {
    this.setState({ name: "" });
    this.setState({ desc: "" });
    this.setState({ complete: "" });
    this.setState({ task_list: "" });
    this.setState({ max: "" });
    this.setState({ hash: "" });
    this.setState({ community: "" });
    this.setState({ winner: "" });
    this.setState({ cover: "" });
    this.setState({ hash: "" });
    this.setState({ edit_challenge_id: "" });
  }

  onChange(e) {
    const { name, value } = e.currentTarget;
    this.setState({ [name]: value });
  }


  render() {
    return (
      <Epic activeStory={this.state.activeStory} tabbar={
        <Tabbar>
          <TabbarItem
            onClick={this.onStoryChange}
            selected={this.state.activeStory === 'feed'}
            data-story="feed"
            text="Лента"
          ><Icon28Newsfeed /></TabbarItem>
          <TabbarItem
            onClick={this.onStoryChange}
            selected={this.state.activeStory === 'index'}
            data-story="index"
            text="Новости"
          ><Icon28Menu /></TabbarItem>
          <TabbarItem
            onClick={this.onStoryChange}
            selected={this.state.activeStory === 'more'}
            data-story="more"
            text="Профиль"
          ><Icon28User /></TabbarItem>
        </Tabbar>
      }>
        <View activePanel="feed_panel" id="feed">
          <Panel id="feed_panel">
            <PanelHeader noShadow>
              Челлендж дня
              </PanelHeader>
            <Group>
              <Cell
                // photo="https://pp.userapi.com/c841034/v841034569/3b8c1/pt3sOw_qhfg.jpg"
                description="VKontakte"
                before={<Avatar src="https://sun9-27.userapi.com/c850420/v850420541/1d0816/iWd-ZryQSW8.jpg" size={80} />}
                size="l"
              >
                VK_Hackathon
                </Cell>
              <Div>

              </Div>
            </Group>
            <Group title='Вступительное видео'>
              <YouTube videoId='qwz3IOBIGgA' opts={youtube_opts} />
            </Group>
            <Group title="Чеклист">
              <Group>
                {/* <Div>
                  <InfoRow title="3/5">
                    <Progress value={40} />
                  </InfoRow>
                </Div> */}
                <Group title="Задания">
                  <List>
                    {this.state.main.tasks.map((task, index) =>
                      <Cell
                        multiline
                        asideContent={<Button onClick={() => { this.getApiData(task.type, task.value); api_data.index = index; api_data.id = "main" }} before={<Icon16Done />}>Я сделал</Button>}
                        description={task.description}
                      >
                        Задание {index}
                      </Cell>
                    )}
                  </List>
                  <Group>
                    <Div style={{ display: 'flex' }}>
                      <Button size="l" stretched style={{ marginRight: 8 }}>Я участвую!</Button>
                      <Button size="l" stretched level="secondary">Я понял!</Button>
                    </Div>
                  </Group>
                </Group>
              </Group>
            </Group>
          </Panel>
        </View>

        <View activePanel="list" id="index">
          <Panel id="list">
            <PanelHeader noShadow>
              Список конкурсов
            </PanelHeader>

            <Group>
              {this.state.all_challenges.length > 0 &&
                <List>
                  {this.state.all_challenges.map((item) => (
                    <Group>
                      <Cell
                        size="l"
                        description={"#" + item.hashtag}
                        before={<Avatar src={item.user_photo} />}
                      >
                        {item.first_name} {item.last_name}
                      </Cell>
                      <Card>
                        <CardActionArea>
                          <img style={{ maxWidth: "370px" }} src={item.cover} />
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                              {item.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardActions>
                          <Button onClick={() => { this.get_one_challenge(item._id) }} size="xl" color="primary">
                            Подробно
                         </Button>
                        </CardActions>
                      </Card>
                    </Group>
                  )
                  )}
                </List>
              } </Group>
          </Panel>
        </View>

        <View activePanel="new-user" id="view4">
          <Panel id="new-user" theme="white">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'more' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} noShadow>Мои конкурсы</PanelHeader>
            <Tabs theme="header" type="buttons">
              <TabsItem
                onClick={() => this.setState({ activeTab6: 'active' })}
                selected={this.state.activeTab6 === 'active'}>
                Активные
              </TabsItem>
              <TabsItem
                onClick={() => this.setState({ activeTab6: 'ended' })}
                selected={this.state.activeTab6 === 'ended'}>
                Завершенные
              </TabsItem>
            </Tabs>

            {this.state.activeTab6 === 'active' ? <Group>
              {this.state.challenge_obj.length > 0 &&
                <List>
                  {this.state.challenge_obj.map((item) => (
                    <Group>
                      <Cell
                        size="l"
                        description={"#" + item.hashtag}
                        asideContent={<Icon28Write onClick={() => { this.setState({ edit: true }); this.restoreState(item); this.setState({ activeStory: 'create' }) }} fill="var(--accent)" />}
                        before={<Avatar src={item.user_photo} />}
                      >
                        {item.first_name} {item.last_name}
                      </Cell>
                      <Div style={{ display: 'flex' }}>
                        <Button onClick={() => { this.startChallenge(item._id) }} size="l" level="commerce" stretched style={{ marginRight: 8 }}>Старт</Button>
                        <Button onClick={() => { this.stopChallenge(item._id) }} size="l" level="destructive" stretched >Стоп</Button>
                      </Div>
                      <Card>
                        <CardActionArea>
                          <img style={{ maxWidth: "370px" }} src={item.cover} />
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                              {item.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardActions>
                          <Button stretched onClick={() => { this.get_one_challenge(item._id) }} size="xl" color="primary">
                            Подробно
                         </Button>
                        </CardActions>
                      </Card>
                    </Group>
                  )
                  )}
                </List>
              } </Group> : ""}


            {this.state.activeTab6 === 'ended' ? <Group>
              {this.state.challenge_obj.length > 0 &&
                <List>
                  {this.state.challenge_obj.map((item) => (
                    item.status === "STOPPED" &&
                    <Cell before={<Avatar type="image" src="https://pp.userapi.com/c841025/v841025503/617f7/bkN1Def0s14.jpg" />} description={item.name} asideContent={<Icon24Add fill="var(--accent)" />}> {item.description}</Cell>
                  )
                  )}
                </List>
              } </Group> : ""}
          </Panel>
        </View>

        <View activePanel="pep" id="create">
          <Panel id="pep" theme="white">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ edit: false }); this.setState({ activeStory: 'more' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>}>
              {this.state.edit ? "Изменить" : "Создать"}
            </PanelHeader>
            <FormLayout>
              <Input value={this.state.name} top="Название" name="name" onChange={this.onChange} />
              <Input value={this.state.desc} top="Описание" name="desc" onChange={this.onChange} />
              <Input value={this.state.cover} top="Фото" name="cover" onChange={this.onChange} />
              <Input value={this.state.complete} top="Сообщение по завершении" name="complete" onChange={this.onChange} />
              <Input value={this.state.hash} top="Хештег челленджа" name="hash" onChange={this.onChange} />
              <Input value={this.state.max} top="Макс. участников" name="max" onChange={this.onChange} />
              <Group title="Кол-во победителей">
                <Select value={this.state.winner} name="winner" onChange={this.onChange} >
                  <option value="0">Нет победителя</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Select>
              </Group>
              {this.state.user_obj.connected_groups.length > 0 &&
                <Group title="Автор">
                  <Select value={this.state.community} name="community" onChange={this.onChange} >
                    <option value="My account">Мой аккаунт</option>
                    {this.state.user_obj.connected_groups.map((item) => (
                      <option key={item.group_id} value={item.group_id}>{item.group_name}</option>
                    ))}
                  </Select>
                </Group>
              }
              <Group title="Категория">
                <Select value={this.state.category} name="category" onChange={this.onChange} >
                  <option value="0">Нет победителя</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Select>
              </Group>

              <Group title="Задания">
                {this.state.task_list.length > 0 &&
                  <List>
                    {this.state.task_list.map((item, index) => (
                      <Cell key={item} removable onRemove={() => {
                        this.setState({
                          task_list: [...this.state.task_list.slice(0, index), ...this.state.task_list.slice(index + 1)]
                        })
                      }}>Тип: {item.type} <br /> Описание: {item.description}</Cell>
                    ))}
                  </List>
                }
                <CellButton onClick={() => { this.setState({ activeStory: 'task' }) }} before={<Icon24Add />} >Добавить задание</CellButton>
              </Group>
              {this.state.edit &&
                <Button onClick={() => { this.editChallenge(); this.setState({ edit: false }); this.setState({ activeStory: 'view1' }) }} size="xl">Изменить</Button>}
              {!this.state.edit &&
                <Button onClick={() => { this.resetState(); this.getGroupById(this.state.community); this.setState({ activeStory: 'view1' }) }} size="xl">Создать</Button>}
            </FormLayout>
          </Panel>
        </View>

        <View activePanel="new_task" id="task">
          <Panel id="new_task" theme="white">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'create' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} >Добавить задание</PanelHeader>
            <FormLayout>
              <Select placeholder="Тип" name="name_task" onChange={this.onChange} >
                <option value="Хештег">Хештег</option>
                <option value="Репост">Репост</option>
                <option value="Подписка">Подписка</option>
                <option value="Хештег и фото">Хештег и фото</option>
                <option value="Отметка пользователя">Отметка пользователя</option>
                <option value="Лайк">Лайк</option>
              </Select>
              <Input top="Описание" name="desc_task" onChange={this.onChange} />
              <Input top="Значение" name="value_task" onChange={this.onChange} />
              <Button onClick={() => {
                this.state.task_list.push({
                  type: this.state.name_task,
                  description: this.state.desc_task, value: this.state.value_task
                }); this.setState({ activeStory: 'create' })
              }} size="xl" >Добавить</Button>
            </FormLayout>
          </Panel>
        </View>

        <View id="more" activePanel="more">
          <Panel id="more">
            <PanelHeader>
              <PanelHeaderContent
                status="Личный кабинет"
                before={<Avatar size={40} src={this.state.user_obj_vk.photo_200} />}>
                {this.state.user_obj_vk.first_name} {this.state.user_obj_vk.last_name}
              </PanelHeaderContent>
            </PanelHeader>
            <Group>
              <List>
                <Cell onClick={() => { this.setState({ activeStory: 'user_groups' }) }} expandable before={<Icon24Users />}>Мои группы</Cell>
                <Cell onClick={() => { this.setState({ activeStory: 'view4' }) }} before={<Icon24Poll />}>Мои конкурсы</Cell>
                <Cell onClick={() => { this.setState({ activeStory: 'joined' }) }} before={<Icon24DoneOutline />}>Я участвую</Cell>
                <Cell onClick={() => { this.setState({ activeStory: 'create' }) }} before={<Icon28AddOutline />}>Создать конкурс</Cell>
              </List>
            </Group>
          </Panel>
        </View>

        <View activePanel="usr_groups" id="user_groups">
          <Panel id="usr_groups">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'more' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} >
              Группы
            </PanelHeader>
            <Group>
              <Div>
                На данном экране Вы можете подключить в приложение сообщества, в которых являетесь администратором, чтобы иметь возможность создавать челленджи от их имени!
             </Div>
            </Group>
            <Group>
              {this.state.user_groups.length > 0 &&
                this.state.user_groups.map((item) => (
                  <Cell
                    size="l"
                    before={<Avatar src={item.photo_100} />}
                    bottomContent={<Button onClick={() => { this.addGroup(item.id, item.name); this.getUser() }} >Добавить</Button>}
                  >
                    {item.name}
                  </Cell>
                ))
              }
            </Group>
          </Panel>
        </View>

        <View activePanel="join" id="joined">
          <Panel id="join">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'more' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} >
              Я участвую
            </PanelHeader>
            <Group>
              {this.state.all_challenges.length > 0 &&
                <List>
                  {this.state.all_challenges.map((item) => (
                    item.participants.includes(this.state.user_obj._id.toString()) &&
                    <Group>
                      <Cell
                        size="l"
                        description={"#" + item.hashtag}
                        before={<Avatar src={item.user_photo} />}
                      >
                        {item.first_name} {item.last_name}
                      </Cell>
                      <Card>
                        <CardActionArea>
                          <img style={{ maxWidth: "370px" }} src={item.cover} />
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                              {item.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardActions>
                          <Button stretched onClick={() => { this.get_one_challenge(item._id) }} size="xl" color="primary">
                            Подробно
                         </Button>
                        </CardActions>
                      </Card>
                    </Group>
                  )
                  )}
                </List>
              }
            </Group>
          </Panel>
        </View>

        <View activePanel="ch_info" id="challenge_info">
          <Panel id="ch_info">
            <ChallengeInfo token={this.state.token} challenge={this.state.one_challenge_obj}
              user_id={this.state.user_obj_vk.id} user={this.state.user_obj} tasks={this.state.one_challenge_obj.tasks} name={this.state.one_challenge_obj.name} desc={this.state.one_challenge_obj.description}
              cover={this.state.one_challenge_obj.cover} />
          </Panel>
        </View>

      </Epic>
    )
  }
}

<VKchallenge />
ReactDOM.render(<VKchallenge />, document.getElementById('root')); 
